import React from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { X, Settings } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import InfographicSettingsPanel from '@/components/sidebar/InfographicSettingsPanel';
    import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


    const InfographicEditDrawer = ({ isOpen, onClose, config, onConfigChange, tableHeaders, brandConfig }) => {
      const drawerVariants = {
        hidden: { x: '100%' },
        visible: { x: '0%' },
      };

      if (!isOpen) return null;

      return (
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
              />
              {/* Drawer */}
              <motion.div
                key="drawer"
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-slate-800">Edit Infographic</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-grow p-4">
                  {config && tableHeaders ? (
                     <InfographicSettingsPanel
                        key={config.id} 
                        config={config}
                        onConfigChange={onConfigChange}
                        tableHeaders={tableHeaders}
                        brandConfig={brandConfig}
                      />
                  ) : (
                    <Card className="text-center p-6">
                      <CardHeader>
                        <CardTitle>No Chart Selected</CardTitle>
                        <CardDescription>Select a chart to edit its settings.</CardDescription>
                      </CardHeader>
                    </Card>
                  )}
                </ScrollArea>
                 <div className="p-4 border-t border-slate-200 sticky bottom-0 bg-slate-50 z-10">
                    <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90">Done</Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      );
    };

    export default InfographicEditDrawer;