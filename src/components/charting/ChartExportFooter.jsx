import React from 'react';
    import { getFullFooterText } from '@/config/siteBranding';

    const ChartExportFooter = ({ articleName, logoUrl, secondaryColor, font, footerTextTemplate, showLogo, logoPlacement }) => {
      const displayFooterText = getFullFooterText(footerTextTemplate, articleName);
      const footerFontFamily = `"${font || 'Poppins'}", sans-serif`;

      const logoStyle = {
        maxHeight: '40px',
        maxWidth: '160px',
        objectFit: 'contain',
      };

      let justifyContent = 'space-between';
      let logoIsInline = false;

      if (showLogo && (logoPlacement === 'bottom-left' || logoPlacement === 'bottom-right')) {
        logoIsInline = true;
        if (logoPlacement === 'bottom-left') justifyContent = 'flex-start';
        else if (logoPlacement === 'bottom-right') justifyContent = 'flex-end';
      } else if (!showLogo || logoPlacement === 'center') {
         justifyContent = 'center';
      }


      return (
        <div style={{
          width: '100%',
          height: '60px', 
          backgroundColor: secondaryColor || '#1F2937',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: justifyContent,
          padding: '10px 40px', 
          boxSizing: 'border-box',
          fontSize: '16px', 
          fontWeight: '500',
          fontFamily: footerFontFamily,
          position: 'relative', 
          zIndex: 20
        }}>
          {logoIsInline && logoPlacement === 'bottom-left' && logoUrl && (
            <img src={logoUrl} alt={`${articleName || 'Site'} Logo`} style={{...logoStyle, marginRight: '20px' }} />
          )}
          
          <span>{displayFooterText}</span>
          
          {logoIsInline && logoPlacement === 'bottom-right' && logoUrl && (
            <img src={logoUrl} alt={`${articleName || 'Site'} Logo`} style={{...logoStyle, marginLeft: '20px' }} />
          )}
        </div>
      );
    };

    export default ChartExportFooter;