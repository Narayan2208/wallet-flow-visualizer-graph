
/**
 * Exports the current graph visualization as an SVG file
 * @param svgElement The SVG element to export
 * @param filename The name of the exported file
 */
export const exportSvgToFile = (svgElement: SVGSVGElement, filename = 'wallet-flow.svg'): void => {
  if (!svgElement) return;

  // Create a copy of the SVG to modify
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
  
  // Add proper namespaces
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  
  // Add width and height attributes if they're missing
  if (!svgClone.hasAttribute('width')) {
    svgClone.setAttribute('width', svgElement.getBoundingClientRect().width.toString());
  }
  
  if (!svgClone.hasAttribute('height')) {
    svgClone.setAttribute('height', svgElement.getBoundingClientRect().height.toString());
  }
  
  // Extract the current styles that apply to the SVG
  const styleSheet = document.createElement('style');
  const cssRules: string[] = [];
  
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      const rules = sheet.cssRules || sheet.rules;
      
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (rule.cssText.includes('svg') || 
            rule.cssText.includes('node') || 
            rule.cssText.includes('edge')) {
          cssRules.push(rule.cssText);
        }
      }
    } catch (e) {
      console.warn('Failed to access stylesheet rules', e);
    }
  }
  
  styleSheet.textContent = cssRules.join('\n');
  svgClone.insertBefore(styleSheet, svgClone.firstChild);
  
  // Convert to SVG string
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  
  // Create a Blob and download link
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up
  URL.revokeObjectURL(url);
};
