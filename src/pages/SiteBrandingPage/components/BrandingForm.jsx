import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { FileImage as ImageIcon, Type, UploadCloud, Palette, AlignCenter, AlignStartVertical, AlignEndVertical, AlignLeft, AlignRight, Trash2, Paintbrush, Grid, Bold, Square, Palette as PaletteIcon, TextCursorInput, ListTree } from 'lucide-react';
import { predefinedPalettes } from '@/config/colorPalettes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const googleFonts = [
  'Poppins', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Nunito', 'Merriweather', 'Playfair Display', 'Inter', 'Source Sans Pro', 'Arial', 'Verdana', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New'
];

export const fontWeights = [
    { value: 'lighter', label: 'Lighter' },
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: 'bolder', label: 'Bolder' },
    { value: '300', label: '300 (Light)' },
    { value: '400', label: '400 (Regular)' },
    { value: '500', label: '500 (Medium)' },
    { value: '600', label: '600 (Semi-Bold)' },
    { value: '700', label: '700 (Bold)' },
];

export const logoPlacements = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left (Footer)' },
  { value: 'bottom-right', label: 'Bottom Right (Footer)' },
  { value: 'center', label: 'Center (Watermark)' },
];

export const titlePlacements = [
    { value: 'top', label: 'Top (Default)', icon: <AlignStartVertical className="mr-2 h-4 w-4" /> },
    { value: 'center', label: 'Center (Vertical)', icon: <AlignCenter className="mr-2 h-4 w-4" /> },
    { value: 'bottom', label: 'Bottom', icon: <AlignEndVertical className="mr-2 h-4 w-4" /> },
    { value: 'none', label: 'Hidden', icon: <Type className="mr-2 h-4 w-4 opacity-50" /> },
];

export const titleAlignments = [
    { value: 'left', label: 'Left', icon: <AlignLeft className="mr-2 h-4 w-4" /> },
    { value: 'center', label: 'Center', icon: <AlignCenter className="mr-2 h-4 w-4" /> },
    { value: 'right', label: 'Right', icon: <AlignRight className="mr-2 h-4 w-4" /> },
];

const SectionCard = ({ title, icon, children }) => (
  <div className="space-y-3 p-4 border rounded-lg bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
    <h3 className="font-semibold text-md text-slate-700 flex items-center mb-3">
      {icon} {title}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);


const BrandingForm = ({
  branding,
  handleInputChange,
  setLogoFile,
  handleLogoUpload,
  uploadingLogo,
  logoFile,
  customColors,
  handleColorPaletteTypeChange,
  handlePredefinedPaletteKeyChange,
  handleCustomColorChange,
  addCustomColor,
  removeCustomColor
}) => {
  return (
    <div className="space-y-6 p-1">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="space-y-6">
            <SectionCard title="Infographic Identity" icon={<TextCursorInput className="mr-2 h-5 w-5 text-primary"/>}>
              <div>
                <Label htmlFor="articleName">Series Name (for footer, ZIP)</Label>
                <Input id="articleName" value={branding.article_name || ''} onChange={(e) => handleInputChange('article_name', e.target.value)} placeholder="e.g., Quarterly Sales Report" />
              </div>
            </SectionCard>

            <SectionCard title="Logo" icon={<ImageIcon className="mr-2 h-5 w-5 text-primary"/>}>
              <div>
                <Label htmlFor="logoFile">Upload Logo (PNG, JPG, SVG)</Label>
                <Input id="logoFile" type="file" accept=".png,.jpg,.jpeg,.svg" onChange={(e) => setLogoFile(e.target.files[0])} />
                <Button onClick={handleLogoUpload} disabled={!logoFile || uploadingLogo} size="sm" className="mt-2 w-full">
                  {uploadingLogo ? <><UploadCloud className="mr-2 h-4 w-4 animate-pulse"/> Uploading...</> : <><UploadCloud className="mr-2 h-4 w-4"/> Upload Logo</>}
                </Button>
              </div>
              {branding.logo_url && (
                <div className="mt-2">
                  <Label>Current Logo:</Label>
                  <img src={branding.logo_url} alt="Current Logo" className="mt-1 max-h-16 border p-1 rounded bg-white object-contain" />
                </div>
              )}
              <div>
                <Label htmlFor="logoPlacement">Logo Placement (Export)</Label>
                <Select value={branding.logo_placement} onValueChange={(value) => handleInputChange('logo_placement', value)}>
                  <SelectTrigger><SelectValue placeholder="Select placement" /></SelectTrigger>
                  <SelectContent>
                    {logoPlacements.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showLogo" checked={branding.show_logo} onCheckedChange={(checked) => handleInputChange('show_logo', checked)} />
                <Label htmlFor="showLogo" className="font-normal">Show Logo on Infographics</Label>
              </div>
            </SectionCard>

            <SectionCard title="Footer" icon={<AlignEndVertical className="mr-2 h-5 w-5 text-primary"/>}>
              <div className="flex items-center space-x-2">
                <Checkbox id="showFooter" checked={branding.show_footer} onCheckedChange={(checked) => handleInputChange('show_footer', checked)} />
                <Label htmlFor="showFooter" className="font-normal">Show Footer on Infographics</Label>
              </div>
              <div>
                <Label htmlFor="footerText">Footer Text (use {'{year}'} & {'{articleName}'})</Label>
                <Input id="footerText" value={branding.footer_text} onChange={(e) => handleInputChange('footer_text', e.target.value)} placeholder="e.g., {articleName} | © Copyright {year}" />
              </div>
              <div>
                <Label htmlFor="footer_color">Footer Background Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="footer_color" type="color" value={branding.footer_color || '#1F2937'} onChange={(e) => handleInputChange('footer_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                    <Input type="text" value={branding.footer_color || '#1F2937'} onChange={(e) => handleInputChange('footer_color', e.target.value)} placeholder="#1F2937" className="flex-1"/>
                </div>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="space-y-6">
            <SectionCard title="Typography" icon={<Type className="mr-2 h-5 w-5 text-primary"/>}>
              <div>
                <Label htmlFor="fontFamily">Infographic Font</Label>
                <Select value={branding.font_family} onValueChange={(value) => handleInputChange('font_family', value)}>
                  <SelectTrigger><SelectValue placeholder="Select font" /></SelectTrigger>
                  <SelectContent>
                    {googleFonts.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fontWeight">Font Weight</Label>
                <Select value={branding.font_weight || 'normal'} onValueChange={(value) => handleInputChange('font_weight', value)}>
                  <SelectTrigger><SelectValue placeholder="Select font weight" /></SelectTrigger>
                  <SelectContent>
                    {fontWeights.map(weight => <SelectItem key={weight.value} value={weight.value}>{weight.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </SectionCard>

            <SectionCard title="Layout & Colors" icon={<PaletteIcon className="mr-2 h-5 w-5 text-primary"/>}>
              <div>
                <Label htmlFor="backgroundColor">Infographic Background Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="backgroundColor" type="color" value={branding.background_color} onChange={(e) => handleInputChange('background_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                    <Input type="text" value={branding.background_color} onChange={(e) => handleInputChange('background_color', e.target.value)} placeholder="#FFFFFF" className="flex-1"/>
                </div>
              </div>
              <div>
                <Label htmlFor="titlePlacement">Title Position (Vertical)</Label>
                <Select value={branding.title_placement} onValueChange={(value) => handleInputChange('title_placement', value)}>
                  <SelectTrigger><SelectValue placeholder="Select title position" /></SelectTrigger>
                  <SelectContent>
                    {titlePlacements.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center">{opt.icon}{opt.label}</span>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="titleAlignment">Title Alignment (Horizontal)</Label>
                <Select value={branding.title_alignment} onValueChange={(value) => handleInputChange('title_alignment', value)}>
                  <SelectTrigger><SelectValue placeholder="Select title alignment" /></SelectTrigger>
                  <SelectContent>
                    {titleAlignments.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center">{opt.icon}{opt.label}</span>
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title_color">Title Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="title_color" type="color" value={branding.title_color || '#333333'} onChange={(e) => handleInputChange('title_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                    <Input type="text" value={branding.title_color || '#333333'} onChange={(e) => handleInputChange('title_color', e.target.value)} placeholder="#333333" className="flex-1"/>
                </div>
              </div>
            </SectionCard>
            
            <SectionCard title="Chart Elements" icon={<Grid className="mr-2 h-5 w-5 text-primary"/>}>
              <div>
                <Label htmlFor="legend_color">Legend Text Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="legend_color" type="color" value={branding.legend_color || '#333333'} onChange={(e) => handleInputChange('legend_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                    <Input type="text" value={branding.legend_color || '#333333'} onChange={(e) => handleInputChange('legend_color', e.target.value)} placeholder="#333333" className="flex-1"/>
                </div>
              </div>
              <div>
                <Label htmlFor="axis_tick_color">Axis Numbers Color</Label>
                <div className="flex items-center gap-2">
                    <Input id="axis_tick_color" type="color" value={branding.axis_tick_color || '#666666'} onChange={(e) => handleInputChange('axis_tick_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                    <Input type="text" value={branding.axis_tick_color || '#666666'} onChange={(e) => handleInputChange('axis_tick_color', e.target.value)} placeholder="#666666" className="flex-1"/>
                </div>
              </div>
              <div>
                <Label htmlFor="axis_label_color">Axis Titles Color (e.g., X-Axis Label)</Label>
                <div className="flex items-center gap-2">
                    <Input id="axis_label_color" type="color" value={branding.axis_label_color || '#555555'} onChange={(e) => handleInputChange('axis_label_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                    <Input type="text" value={branding.axis_label_color || '#555555'} onChange={(e) => handleInputChange('axis_label_color', e.target.value)} placeholder="#555555" className="flex-1"/>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="showGridLines" checked={branding.show_grid_lines} onCheckedChange={(checked) => handleInputChange('show_grid_lines', checked)} />
                <Label htmlFor="showGridLines" className="font-normal">Show Chart Grid Lines</Label>
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-6">
            <SectionCard title="Chart Data Colors" icon={<Palette className="mr-2 h-5 w-5 text-primary"/>}>
              <Select value={branding.chart_color_scheme_json?.type || 'predefined'} onValueChange={handleColorPaletteTypeChange}>
                <SelectTrigger><SelectValue placeholder="Select scheme type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="predefined">Predefined Palettes</SelectItem>
                  <SelectItem value="custom">Custom Colors</SelectItem>
                </SelectContent>
              </Select>

              {branding.chart_color_scheme_json?.type === 'predefined' && (
                <div className="mt-2 space-y-1">
                  <Label htmlFor="predefinedPalette">Select Palette</Label>
                  <Select value={branding.chart_color_scheme_json.key || 'default'} onValueChange={handlePredefinedPaletteKeyChange}>
                    <SelectTrigger id="predefinedPalette"><SelectValue placeholder="Choose a palette" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(predefinedPalettes).map(key => (
                        <SelectItem key={key} value={key} className="capitalize">{key}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex space-x-1 mt-2 h-6">
                    {(predefinedPalettes[branding.chart_color_scheme_json.key || 'default'] || []).map((color, idx) => (
                      <div key={idx} style={{ backgroundColor: color }} className="w-6 h-6 rounded-sm border border-slate-300" title={color}></div>
                    ))}
                  </div>
                </div>
              )}

              {branding.chart_color_scheme_json?.type === 'custom' && (
                <div className="mt-2 space-y-2">
                  <Label>Define Custom Colors (up to 6)</Label>
                  {customColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input type="color" value={color} onChange={(e) => handleCustomColorChange(index, e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                      <Input type="text" value={color} onChange={(e) => handleCustomColorChange(index, e.target.value)} placeholder="#RRGGBB" className="flex-1"/>
                      {customColors.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeCustomColor(index)} aria-label="Remove color">
                          <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                      )}
                    </div>
                  ))}
                  {customColors.length < 6 && (
                    <Button variant="outline" size="sm" onClick={addCustomColor} className="w-full mt-1">Add Color</Button>
                  )}
                </div>
              )}
            </SectionCard>
            
            <SectionCard title="Export Border" icon={<Square className="mr-2 h-5 w-5 text-primary"/>}>
                <div className="flex items-center space-x-2">
                    <Checkbox id="showChartBorder" checked={branding.show_chart_border} onCheckedChange={(checked) => handleInputChange('show_chart_border', checked)} />
                    <Label htmlFor="showChartBorder" className="font-normal">Enable Border on Exported Image</Label>
                </div>
                {branding.show_chart_border && (
                    <div>
                        <Label htmlFor="chart_border_color">Border Color</Label>
                        <div className="flex items-center gap-2">
                            <Input id="chart_border_color" type="color" value={branding.chart_border_color || '#cccccc'} onChange={(e) => handleInputChange('chart_border_color', e.target.value)} className="w-10 h-10 p-1 shrink-0"/>
                            <Input type="text" value={branding.chart_border_color || '#cccccc'} onChange={(e) => handleInputChange('chart_border_color', e.target.value)} placeholder="#cccccc" className="flex-1"/>
                        </div>
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Data Notes" icon={<ListTree className="mr-2 h-5 w-5 text-primary"/>}>
                <div>
                    <Label htmlFor="predictedNote">Note for Predicted Data (e.g. *forecasted)</Label>
                    <Input id="predictedNote" value={branding.predicted_note || ''} onChange={(e) => handleInputChange('predicted_note', e.target.value)} placeholder="Enter note for predictions" />
                </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandingForm;
