export abstract class FileService{

    //
    //  Takes a string and a filename, downloads it as a file
    //
    public static downloadAsJSON(fileString, filename) {

      let blob = new Blob([fileString], {type: 'application/json'});

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
      } else {
          const a = document.createElement('a');
          document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = filename;
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0)
      }
    }


}
