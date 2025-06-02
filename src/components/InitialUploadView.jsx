import React from 'react';
    import mammoth from 'mammoth';
    import { UploadCloud, FileText as FileTextIcon } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const InitialUploadView = ({ onTablesExtracted }) => {
      const { toast } = useToast();

      const extractTablesAndPrecedingText = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const tables = Array.from(doc.querySelectorAll('table'));
        const results = [];
      
        tables.forEach(tableElement => {
          let precedingElement = tableElement.previousElementSibling;
          let precedingText = '';
          
          while(precedingElement && precedingElement.tagName !== 'TABLE' && (precedingElement.tagName !== 'P' || precedingElement.textContent.trim().length < 5) ) {
            precedingElement = precedingElement.previousElementSibling;
          }
          if (precedingElement && precedingElement.tagName === 'P') {
            precedingText = precedingElement.textContent.trim();
          }
      
          const headers = Array.from(tableElement.querySelectorAll('thead th, tbody tr:first-child th, tbody tr:first-child td'))
                              .map(th => th.textContent.trim()).filter(h => h);
          
          let dataRows;
          if (tableElement.querySelector('tbody')) {
              dataRows = Array.from(tableElement.querySelectorAll('tbody tr'));
              if(!tableElement.querySelector('thead') && headers.length > 0 && dataRows.length > 0) { 
                 const firstRowCells = Array.from(dataRows[0].querySelectorAll('td, th')).map(c => c.textContent.trim());
                 if (firstRowCells.every((cell, idx) => cell === headers[idx])) {
                    dataRows = dataRows.slice(1); 
                 }
              }
          } else {
              dataRows = Array.from(tableElement.querySelectorAll('tr')).slice(1);
          }
      
          const data = dataRows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            const rowData = {};
            headers.forEach((header, index) => {
              rowData[header] = cells[index] ? cells[index].textContent.trim() : '';
            });
            return rowData;
          }).filter(obj => Object.values(obj).some(val => val !== ''));
          
          if (headers.length > 0 && data.length > 0) {
            results.push({ table: { headers, data }, precedingText });
          }
        });
        return results;
      };

      const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) { 
            toast({ variant: "destructive", title: "File Too Large", description: "Please upload DOCX files under 5MB."});
            return;
          }
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const result = await mammoth.convertToHtml({ arrayBuffer: e.target.result });
              const tablesWithContext = extractTablesAndPrecedingText(result.value);
              
              if (tablesWithContext.length === 0) {
                toast({ variant: "destructive", title: "No Usable Tables Found", description: "Could not find any tables with headers and data in the DOCX file."});
                onTablesExtracted([], file.name);
                return;
              }
              
              onTablesExtracted(tablesWithContext, file.name); 

              toast({
                title: "DOCX Parsed Successfully!",
                description: `${tablesWithContext.length} table(s) extracted from ${file.name}.`,
              });
            } catch (error) {
              console.error("Error parsing DOCX:", error);
              toast({
                variant: "destructive",
                title: "DOCX Parsing Error",
                description: error.message || "Could not process the DOCX file.",
              });
            }
          };
          reader.readAsArrayBuffer(file);
        }
      };

      return (
        <motion.main 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-grow flex items-center justify-center w-full p-4"
        >
          <Card className="w-full max-w-xl shadow-2xl bg-white/80 backdrop-blur-md">
            <CardHeader className="text-center p-8">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <UploadCloud className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">Upload a Word document</CardTitle>
              <CardDescription className="text-slate-600 text-base mt-2">
                Drag and drop a .docx file, or click to browse.
                <br />
                We'll extract tables and help you create beautiful infographics.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Label htmlFor="initial-docx-upload" className="sr-only">Upload DOCX File</Label>
              <Input 
                id="initial-docx-upload" 
                type="file" 
                accept=".docx" 
                onChange={handleFileUpload} 
                className="w-full text-base p-4 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-semibold
                           file:bg-primary/10 file:text-primary
                           hover:file:bg-primary/20 transition-colors duration-200
                           focus-visible:ring-primary/50"
              />
            </CardContent>
          </Card>
        </motion.main>
      );
    };

    export default InitialUploadView;