import React from 'react';
    import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select"

    const zoomLevels = [
      { value: 0.5, label: '50%' },
      { value: 0.75, label: '75%' },
      { value: 1.0, label: '100%' },
      { value: 1.25, label: '125%' },
      { value: 1.5, label: '150%' },
    ];

    const ZoomControl = ({ currentZoom, onZoomChange }) => {
      const handleZoomChange = (value) => {
        onZoomChange(parseFloat(value));
      };

      const currentZoomLevelObject = zoomLevels.find(zl => zl.value === currentZoom);
      
      const zoomIn = () => {
        const currentIndex = zoomLevels.findIndex(zl => zl.value === currentZoom);
        if (currentIndex < zoomLevels.length - 1) {
          onZoomChange(zoomLevels[currentIndex + 1].value);
        }
      };

      const zoomOut = () => {
        const currentIndex = zoomLevels.findIndex(zl => zl.value === currentZoom);
        if (currentIndex > 0) {
          onZoomChange(zoomLevels[currentIndex - 1].value);
        }
      };
      
      const resetZoom = () => {
        onZoomChange(1.0);
      };

      return (
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-slate-200">
          <Button variant="ghost" size="icon" onClick={zoomOut} disabled={currentZoom === zoomLevels[0].value} className="h-7 w-7">
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Select value={String(currentZoom)} onValueChange={handleZoomChange}>
            <SelectTrigger className="w-[80px] h-7 text-xs focus:ring-primary/50">
              <SelectValue placeholder="Zoom" />
            </SelectTrigger>
            <SelectContent>
              {zoomLevels.map((level) => (
                <SelectItem key={level.value} value={String(level.value)} className="text-xs">
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={zoomIn} disabled={currentZoom === zoomLevels[zoomLevels.length - 1].value} className="h-7 w-7">
            <ZoomIn className="h-4 w-4" />
          </Button>
           {currentZoom !== 1.0 && (
            <Button variant="ghost" size="icon" onClick={resetZoom} title="Reset Zoom" className="h-7 w-7">
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    };

    export default ZoomControl;