declare module 'react-native-html-to-pdf' {
  interface ConvertOptions {
    html: string;
    fileName?: string;
    directory?: string;
    base64?: boolean;
    width?: number;
    height?: number;
  }

  interface ConvertResult {
    filePath?: string;
    base64?: string;
  }

  const RNHTMLtoPDF: {
    convert: (options: ConvertOptions) => Promise<ConvertResult>;
  };

  export default RNHTMLtoPDF;
}
