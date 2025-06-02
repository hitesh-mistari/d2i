import React from 'react';
    import { LayoutList, BarChart3 } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { cn } from '@/lib/utils';

    const DataSourcePanel = ({ charts, onSelectChart }) => {
      if (!charts || charts.length === 0) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <LayoutList className="mr-2 h-5 w-5 text-primary" /> Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No charts generated yet. Upload a DOCX file.</p>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <LayoutList className="mr-2 h-5 w-5 text-primary" /> Generated Infographics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-60 overflow-y-auto">
            {charts.map((chart) => (
              <Button
                key={chart.id}
                variant="ghost"
                onClick={() => onSelectChart(chart.id)}
                className={cn(
                  'w-full justify-start text-left h-auto py-1.5 px-2 text-slate-700 hover:bg-primary/10 hover:text-primary'
                )}
                title={chart.chartTitle}
              >
                <BarChart3 className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{chart.chartTitle || 'Untitled Chart'}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      );
    };

    export default DataSourcePanel;