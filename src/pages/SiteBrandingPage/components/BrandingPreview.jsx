import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { generateChartOptions, generateChartData } from '@/components/charting/chartUtils';
import ChartExportFooter from '@/components/charting/ChartExportFooter';
import { predefinedPalettes } from '@/config/colorPalettes';
import { Palette, Image as ImageIcon } from 'lucide-react';
import { loadGoogleFont } from '@/lib/utils';

const BrandingPreview = ({ branding, siteName }) => {
  const sampleTableData = {
    headers: ['Category', 'Series 1', 'Series 2'],
    rawData: [
      { 'Category': 'A', 'Series 1': 10, 'Series 2': 15 },
      { 'Category': 'B', 'Series 1': 20, 'Series 2': 25 },
      { 'Category': 'C', 'Series 1': 15, 'Series 2': 10 },
    ],
  };

  const currentFont = branding.font_family || branding.font || 'Poppins';
  React.useEffect(() => {
    if (currentFont) {
      loadGoogleFont(currentFont);
    }
  }, [currentFont]);

  const sampleChartConfig = {
    chartTitle: 'Sample Data Preview',
    description: 'This is how your branding will look.',
    xAxis: 'Category',
    yAxes: ['Series 1', 'Series 2'],
    yAxisLabel: 'Values',
    chartType: 'bar',
    showLegend: true,
    colorPalette: branding.chart_color_scheme_json?.type === 'custom' 
      ? branding.chart_color_scheme_json.colors 
      : predefinedPalettes[branding.chart_color_scheme_json?.key || 'default'],
  };

  const previewBrandConfig = {
      articleName: branding.article_name || siteName,
      logoUrl: branding.logo_url,
      logoPlacement: branding.logo_placement,
      showLogo: branding.show_logo,
      showFooter: branding.show_footer,
      footerColor: branding.footer_color, 
      font: currentFont,
      fontWeight: branding.font_weight,
      footerText: branding.footer_text,
      backgroundColor: branding.background_color,
      titlePlacement: branding.title_placement,
      titleColor: branding.title_color,
      titleAlignment: branding.title_alignment,
      legendColor: branding.legend_color,
      showGridLines: branding.show_grid_lines,
      predictedNote: branding.predicted_note,
      chartColorPalette: branding.chart_color_scheme_json,
      showChartBorder: branding.show_chart_border,
      chartBorderColor: branding.chart_border_color,
      axisTickColor: branding.axis_tick_color,
      axisLabelColor: branding.axis_label_color,
  };

  const previewChartData = generateChartData(sampleTableData, sampleChartConfig, previewBrandConfig);
  const previewChartOptions = generateChartOptions(sampleChartConfig, previewBrandConfig, previewChartData);

  const {
    logoUrl,
    showLogo,
    logoPlacement,
  } = previewBrandConfig;

  const logoContainerStyle = {
    position: 'absolute',
    zIndex: 10,
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  let logoImgStyle = {
    maxHeight: '40px',
    maxWidth: '150px',
    objectFit: 'contain',
  };

  if (logoPlacement === 'top-left') { Object.assign(logoContainerStyle, { top: '10px', left: '10px', justifyContent: 'flex-start' }); }
  else if (logoPlacement === 'top-right') { Object.assign(logoContainerStyle, { top: '10px', right: '10px', justifyContent: 'flex-end' }); }
  else if (logoPlacement === 'center') { 
    Object.assign(logoContainerStyle, { 
        top: '50%', left: '50%', 
        transform: 'translate(-50%, -50%)',
        opacity: 0.15,
        pointerEvents: 'none'
    }); 
    logoImgStyle = { maxHeight: '80px', maxWidth: '250px', objectFit: 'contain' };
  }

  const BORDER_WIDTH = '2px'; // Consistent with export

  return (
    <Card className="lg:col-span-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary"/>Branding Preview</CardTitle>
        <CardDescription>This is a sample chart to preview your branding settings. The actual infographic layout may vary.</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div 
          className="rounded-lg p-4 relative" 
          style={{ 
            backgroundColor: previewBrandConfig.backgroundColor, 
            fontFamily: `"${previewBrandConfig.font || 'Poppins'}", sans-serif`,
            fontWeight: previewBrandConfig.fontWeight || 'normal',
            overflow: 'hidden',
            border: previewBrandConfig.show_chart_border ? `${BORDER_WIDTH} solid ${previewBrandConfig.chart_border_color || '#cccccc'}` : 'none',
            boxSizing: 'border-box',
          }}
        >
          {showLogo && logoUrl && (logoPlacement === 'top-left' || logoPlacement === 'top-right' || logoPlacement === 'center') && (
              <div style={logoContainerStyle}>
                  <img src={logoUrl} alt="Preview Logo" style={logoImgStyle}/>
              </div>
          )}
          {!showLogo && logoPlacement !== 'bottom-left' && logoPlacement !== 'bottom-right' && (
             <div style={logoContainerStyle}>
                <ImageIcon className="h-8 w-8 text-slate-300" />
                <span className="text-xs text-slate-400 ml-2">Logo Hidden</span>
             </div>
          )}
          {!logoUrl && showLogo && logoPlacement !== 'bottom-left' && logoPlacement !== 'bottom-right' && (
             <div style={logoContainerStyle}>
                <ImageIcon className="h-8 w-8 text-slate-300" />
                <span className="text-xs text-slate-400 ml-2">No Logo Uploaded</span>
             </div>
          )}

          <div className="relative h-[400px] sm:h-[500px]">
            <Bar data={previewChartData} options={previewChartOptions} />
          </div>
          {previewBrandConfig.showFooter && (
             <ChartExportFooter 
                articleName={previewBrandConfig.articleName} 
                logoUrl={previewBrandConfig.logoUrl}
                showLogo={previewBrandConfig.showLogo}
                logoPlacement={previewBrandConfig.logoPlacement}
                secondaryColor={previewBrandConfig.footerColor} 
                font={previewBrandConfig.font}
                footerTextTemplate={previewBrandConfig.footerText}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingPreview;
