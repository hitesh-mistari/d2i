import React, { useState, useEffect } from 'react';
    import { Settings, Type, BarChartBig, LineChart, PieChart, Palette, ListTree, Info, AlignVerticalSpaceAround } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { predefinedPalettes } from '@/config/colorPalettes';

    const InfographicSettingsPanel = ({ config, onConfigChange, tableHeaders, brandConfig }) => {
      const [localConfig, setLocalConfig] = useState(config);

      useEffect(() => {
        setLocalConfig(config);
      }, [config]);

      const handleChange = (field, value) => {
        const newConfig = { ...localConfig, [field]: value };
        setLocalConfig(newConfig);
        onConfigChange(newConfig);
      };
      
      const handleYAxisChange = (index, value) => {
        const newYAxes = [...(localConfig.yAxes || [])];
        newYAxes[index] = value;
        handleChange('yAxes', newYAxes);
        updateColorPalette(newYAxes.length);
      };

      const addYAxis = () => {
        const newYAxes = [...(localConfig.yAxes || []), tableHeaders[0] || ''];
        handleChange('yAxes', newYAxes);
        updateColorPalette(newYAxes.length);
      };

      const removeYAxis = (index) => {
        const newYAxes = (localConfig.yAxes || []).filter((_, i) => i !== index);
        handleChange('yAxes', newYAxes);
        updateColorPalette(newYAxes.length);
      };
      
      const updateColorPalette = (numSeries) => {
        const currentPaletteKey = localConfig.paletteKey || 'default';
        const palette = predefinedPalettes[currentPaletteKey] || predefinedPalettes.default;
        handleChange('colorPalette', palette.slice(0, numSeries));
      };

      const handlePaletteChange = (paletteKey) => {
        const palette = predefinedPalettes[paletteKey] || predefinedPalettes.default;
        handleChange('colorPalette', palette.slice(0, (localConfig.yAxes || []).length));
        handleChange('paletteKey', paletteKey);
      };


      if (!localConfig) return null;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="mr-2 h-5 w-5 text-primary" /> Infographic Settings
            </CardTitle>
            <CardDescription>Customize the appearance of the selected chart.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`chart-title-${localConfig.id}`} className="flex items-center"><Type className="mr-2 h-4 w-4 text-muted-foreground" />Title</Label>
              <Input
                id={`chart-title-${localConfig.id}`}
                value={localConfig.chartTitle}
                onChange={(e) => handleChange('chartTitle', e.target.value)}
                placeholder="Enter chart title"
              />
            </div>
            <div>
              <Label htmlFor={`chart-desc-${localConfig.id}`} className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" />Description</Label>
              <Textarea
                id={`chart-desc-${localConfig.id}`}
                value={localConfig.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter chart description (optional)"
                rows={2}
              />
            </div>
            <div>
              <Label className="flex items-center"><BarChartBig className="mr-2 h-4 w-4 text-muted-foreground" />Chart Type</Label>
              <div className="flex space-x-2 mt-1">
                {[{value: 'bar', label: 'Bar', Icon: BarChartBig}, {value: 'line', label: 'Line', Icon: LineChart}, {value: 'pie', label: 'Pie', Icon: PieChart}].map(type => (
                  <Button
                    key={type.value}
                    variant={localConfig.chartType === type.value ? 'default' : 'outline'}
                    onClick={() => handleChange('chartType', type.value)}
                    className="flex-1"
                  >
                    <type.Icon className="mr-2 h-4 w-4" /> {type.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor={`x-axis-${localConfig.id}`} className="flex items-center"><ListTree className="mr-2 h-4 w-4 text-muted-foreground" />X-Axis (Category)</Label>
              <Select value={localConfig.xAxis} onValueChange={(value) => handleChange('xAxis', value)}>
                <SelectTrigger id={`x-axis-${localConfig.id}`}>
                  <SelectValue placeholder="Select X-axis column" />
                </SelectTrigger>
                <SelectContent>
                  {tableHeaders.map((header) => (
                    <SelectItem key={`x-${header}`} value={header}>{header}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
                <Label className="flex items-center"><ListTree className="mr-2 h-4 w-4 text-muted-foreground" />Y-Axes (Values)</Label>
                {(localConfig.yAxes || []).map((yAxis, index) => (
                    <div key={`y-axis-group-${index}`} className="flex items-center space-x-2 mt-1">
                        <Select value={yAxis} onValueChange={(value) => handleYAxisChange(index, value)}>
                            <SelectTrigger id={`y-axis-${localConfig.id}-${index}`}>
                                <SelectValue placeholder={`Select Y-axis ${index + 1}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {tableHeaders.filter(h => h !== localConfig.xAxis).map((header) => (
                                    <SelectItem key={`y-${index}-${header}`} value={header}>{header}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => removeYAxis(index)} aria-label="Remove Y-axis">&times;</Button>
                    </div>
                ))}
                {(localConfig.yAxes || []).length < 5 && (localConfig.yAxes || []).length < tableHeaders.length -1 && (
                     <Button variant="outline" size="sm" onClick={addYAxis} className="mt-2 w-full">Add Y-Axis Series</Button>
                )}
            </div>

            <div>
              <Label htmlFor={`y-axis-label-${localConfig.id}`} className="flex items-center"><AlignVerticalSpaceAround className="mr-2 h-4 w-4 text-muted-foreground" />Y-Axis Label (Unit)</Label>
              <Input
                id={`y-axis-label-${localConfig.id}`}
                value={localConfig.yAxisLabel || ''}
                onChange={(e) => handleChange('yAxisLabel', e.target.value)}
                placeholder="e.g., Users in Millions, Revenue (USD)"
              />
            </div>

            <div>
              <Label htmlFor={`color-palette-${localConfig.id}`} className="flex items-center"><Palette className="mr-2 h-4 w-4 text-muted-foreground" />Color Palette</Label>
              <Select value={localConfig.paletteKey || 'default'} onValueChange={handlePaletteChange}>
                <SelectTrigger id={`color-palette-${localConfig.id}`}>
                  <SelectValue placeholder="Select color palette" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(predefinedPalettes).map((key) => (
                    <SelectItem key={key} value={key} className="capitalize">{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-1 mt-2 h-6">
                {(localConfig.colorPalette || []).map((color, idx) => (
                  <div key={idx} style={{ backgroundColor: color }} className="w-6 h-6 rounded-sm border border-slate-300" title={color}></div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`show-legend-${localConfig.id}`}
                checked={localConfig.showLegend}
                onCheckedChange={(checked) => handleChange('showLegend', checked)}
              />
              <Label htmlFor={`show-legend-${localConfig.id}`} className="text-sm font-normal">Show Legend</Label>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default InfographicSettingsPanel;