import React from 'react';
    import mammoth from 'mammoth';
    import { UploadCloud, FileText } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { generateTitleFromText } from '@/lib/utils';

    const FileUploadPanel = ({ onTablesExtracted, uploadedFileName }) => {
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <UploadCloud className="mr-2 h-5 w-5 text-primary" /> Upload DOCX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="docx-upload-main" className="text-sm font-medium">Select DOCX File</Label>
              <Input id="docx-upload-main" type="file" accept=".docx" onChange={handleFileUpload} className="file:text-primary file:font-semibold hover:file:bg-primary/10 transition-colors duration-300" />
              {uploadedFileName && <p className="text-sm text-muted-foreground mt-1"> <FileText className="inline h-4 w-4 mr-1"/> {uploadedFileName}</p>}
            </div>
          </CardContent>
        </Card>
      );
    };
    export default FileUploadPanel;