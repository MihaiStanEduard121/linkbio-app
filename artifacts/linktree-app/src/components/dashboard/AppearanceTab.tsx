import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button, Input, Label, Switch } from "@/components/ui";
import { useUpdateProfile, getGetMeQueryKey, type UserProfile, type Appearance } from "@workspace/api-client-react";
import { useApiAuth } from "@/lib/auth";

const THEMES = [
  { id: 'dark', name: 'Dark', colors: ['#0f172a', '#1e293b'] },
  { id: 'light', name: 'Light', colors: ['#f8fafc', '#e2e8f0'] },
  { id: 'neon', name: 'Neon', colors: ['#030014', '#a855f7'] },
  { id: 'gradient', name: 'Gradient', colors: ['#4f46e5', '#ec4899'] },
  { id: 'glass', name: 'Glass', colors: ['#475569', '#334155'] },
  { id: 'minimal', name: 'Minimal', colors: ['#ffffff', '#000000'] }
];

const BTN_STYLES = ['solid', 'outline', 'ghost', 'pill', 'shadow', 'neon'];
const FONTS = ['inter', 'poppins', 'roboto', 'mono', 'serif', 'display'];

export function AppearanceTab({ profile, onChange }: { profile: UserProfile, onChange: (a: Appearance) => void }) {
  const authOpts = useApiAuth();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile({ request: authOpts.request });

  const defaultApp: Appearance = profile.appearance || { theme: 'dark', btnStyle: 'solid', btnRadius: 12, btnShadow: true, fontStyle: 'inter' };
  
  const { register, handleSubmit, watch, control, formState: { isDirty, isSubmitting } } = useForm<Appearance>({
    defaultValues: defaultApp
  });

  const currentValues = watch();

  useEffect(() => {
    onChange(currentValues);
  }, [currentValues, onChange]);

  const onSave = async (data: Appearance) => {
    await updateProfile.mutateAsync({ data: { appearance: data } });
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSave)} className="space-y-10 pb-20">
      
      {/* Themes */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="text-xl font-display font-bold mb-6">Themes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Controller name="theme" control={control} render={({field}) => (
            <>
              {THEMES.map(t => (
                <button
                  key={t.id} type="button"
                  onClick={() => field.onChange(t.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden group ${field.value === t.id ? 'border-primary ring-4 ring-primary/20' : 'border-white/10 hover:border-white/30'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-100 transition-opacity" style={{ from: t.colors[0], to: t.colors[1] } as any} />
                  <div className="h-16 w-full rounded-lg mb-3 shadow-inner" style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }} />
                  <span className="relative z-10 font-semibold text-sm">{t.name}</span>
                </button>
              ))}
            </>
          )}/>
        </div>
      </div>

      {/* Buttons */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="text-xl font-display font-bold mb-6">Buttons</h3>
        <div className="space-y-8">
          
          <div className="space-y-3">
            <Label>Fill Style</Label>
            <div className="flex flex-wrap gap-3">
              <Controller name="btnStyle" control={control} render={({field}) => (
                <>
                  {BTN_STYLES.map(s => (
                    <button
                      key={s} type="button" onClick={() => field.onChange(s)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-medium capitalize border transition-colors ${field.value === s ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      {s}
                    </button>
                  ))}
                </>
              )}/>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="flex justify-between">Radius <span>{currentValues.btnRadius}px</span></Label>
              <input type="range" min="0" max="50" {...register("btnRadius", { valueAsNumber: true })} className="w-full accent-primary" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <Label className="text-base">Drop Shadow</Label>
                <p className="text-xs text-white/50 mt-1">Add depth to buttons</p>
              </div>
              <Controller name="btnShadow" control={control} render={({field}) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}/>
            </div>
          </div>
        </div>
      </div>

      {/* Typography & Colors */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl">
        <h3 className="text-xl font-display font-bold mb-6">Fonts & Colors</h3>
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Typeface</Label>
            <div className="flex flex-wrap gap-2">
              <Controller name="fontStyle" control={control} render={({field}) => (
                <>
                  {FONTS.map(f => (
                    <button
                      key={f} type="button" onClick={() => field.onChange(f)}
                      style={{ fontFamily: `var(--font-${f})` }}
                      className={`px-4 py-2 rounded-lg capitalize border transition-colors ${field.value === f ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-white/10 hover:bg-white/5'}`}
                    >
                      {f} Aa
                    </button>
                  ))}
                </>
              )}/>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <Label>Custom Background Color</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-14 p-1 h-12" {...register("bgColor")} />
                <Input type="text" placeholder="#000000" className="flex-1" {...register("bgColor")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-14 p-1 h-12" {...register("textColor")} />
                <Input type="text" placeholder="#ffffff" className="flex-1" {...register("textColor")} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-white/10">
            <Label>Gradient Background (Gradient Theme Only)</Label>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1" {...register("bgGradientFrom")} />
                <Input type="text" placeholder="From" {...register("bgGradientFrom")} />
              </div>
              <div className="flex gap-2">
                <Input type="color" className="w-12 p-1" {...register("bgGradientTo")} />
                <Input type="text" placeholder="To" {...register("bgGradientTo")} />
              </div>
              <Input type="number" placeholder="Angle (deg)" {...register("bgGradientAngle", { valueAsNumber: true })} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:right-[480px] xl:right-[540px] p-6 bg-background/80 backdrop-blur-xl border-t border-white/10 z-30 flex justify-end">
        <Button type="submit" size="lg" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
          Save Appearance
        </Button>
      </div>
    </motion.form>
  );
}
