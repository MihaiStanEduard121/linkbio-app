import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button, Input, Label, Switch } from "@/components/ui";
import { getIcon, ICONS, IconName } from "@/components/Icons";
import { 
  useCreateLink, useUpdateLink, useDeleteLink, useReorderLinks,
  getGetLinksQueryKey, type Link 
} from "@workspace/api-client-react";
import { useApiAuth } from "@/lib/auth";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().optional()
});

function SortableItem({ 
  link, editingId, setEditingId, onUpdate, onDelete, onToggle 
}: { 
  link: Link; editingId: string | null; setEditingId: (id: string | null) => void; onUpdate: any; onDelete: any; onToggle: any;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(linkSchema),
    defaultValues: { title: link.title, url: link.url, icon: link.icon }
  });

  const Icon = getIcon(link.icon);

  const startEdit = () => {
    reset({ title: link.title, url: link.url, icon: link.icon });
    setEditingId(link.id);
  };

  if (editingId === link.id) {
    return (
      <div ref={setNodeRef} style={style} className="glass-panel p-4 rounded-xl mb-4 relative z-20 bg-background/95">
        <form onSubmit={handleSubmit((d) => onUpdate(link.id, d))} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              <Input size={1} placeholder="Title" {...register("title")} />
              <Input size={1} placeholder="URL" {...register("url")} />
              <select 
                {...register("icon")}
                className="flex h-12 w-full rounded-xl border-2 border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                <option value="">No Icon</option>
                {Object.keys(ICONS).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
      <div className="glass-card p-4 rounded-xl mb-4 flex items-center gap-4 group">
        <div {...attributes} {...listeners} className="text-white/30 cursor-grab hover:text-white/80 active:cursor-grabbing px-2">
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-white/70" />
        </div>

        <div className="flex-1 overflow-hidden">
          <h4 className={`font-semibold truncate ${!link.enabled && 'text-white/40'}`}>{link.title}</h4>
          <p className="text-sm text-white/50 truncate mt-0.5">{link.url}</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex px-2 py-1 rounded bg-white/5 text-xs text-white/50 font-mono">
            {link.clicks || 0} clicks
          </div>
          <Switch checked={link.enabled} onCheckedChange={(c) => onToggle(link.id, c)} />
          <Button variant="ghost" size="icon" onClick={startEdit} className="text-white/60 hover:text-white h-9 w-9">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 h-9 w-9">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LinksTab({ links: initialLinks }: { links: Link[] }) {
  const [links, setLinks] = useState(initialLinks.sort((a, b) => a.order - b.order));
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const authOpts = useApiAuth();
  const queryClient = useQueryClient();
  const createLink = useCreateLink({ request: authOpts.request });
  const updateLink = useUpdateLink({ request: authOpts.request });
  const deleteLink = useDeleteLink({ request: authOpts.request });
  const reorder = useReorderLinks({ request: authOpts.request });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(linkSchema) });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });

  const onAdd = async (data: any) => {
    await createLink.mutateAsync({ data });
    invalidate();
    reset();
  };

  const onUpdate = async (id: string, data: any) => {
    await updateLink.mutateAsync({ linkId: id, data });
    invalidate();
    setEditingId(null);
  };

  const onToggle = async (id: string, enabled: boolean) => {
    await updateLink.mutateAsync({ linkId: id, data: { enabled } });
    invalidate();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await deleteLink.mutateAsync({ linkId: id });
    invalidate();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Optimistic UI update
        reorder.mutate({ data: { linkIds: newArray.map(l => l.id) } }, { onSuccess: invalidate });
        return newArray;
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Add Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
        <h3 className="text-xl font-display font-bold mb-6">Create New Link</h3>
        <form onSubmit={handleSubmit(onAdd)} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Latest Video" {...register("title")} />
              {errors.title && <p className="text-destructive text-xs">{errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input placeholder="https://..." {...register("url")} />
              {errors.url && <p className="text-destructive text-xs">{errors.url.message as string}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(ICONS).map(k => {
                const Ico = ICONS[k as IconName];
                return (
                  <label key={k} className="cursor-pointer group">
                    <input type="radio" value={k} {...register("icon")} className="peer sr-only" />
                    <div className="p-3 rounded-xl border-2 border-white/5 bg-white/5 peer-checked:border-primary peer-checked:bg-primary/20 hover:border-white/20 transition-all">
                      <Ico className="w-5 h-5 text-white/70 peer-checked:text-primary group-hover:text-white" />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto mt-4">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2"/>}
            Add Link
          </Button>
        </form>
      </div>

      {/* List */}
      <div>
        <h3 className="text-xl font-display font-bold mb-4 px-2">Your Links</h3>
        {links.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl border-dashed border-white/20">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Link className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/50 text-lg">No links added yet.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={links.map(l=>l.id)} strategy={verticalListSortingStrategy}>
              {links.map((link) => (
                <SortableItem 
                  key={link.id} link={link} editingId={editingId} setEditingId={setEditingId} 
                  onUpdate={onUpdate} onDelete={onDelete} onToggle={onToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </motion.div>
  );
}
