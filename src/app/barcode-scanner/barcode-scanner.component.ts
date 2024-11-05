import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls, BarcodeFormat } from '@zxing/browser';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.css']
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  codeReader: BrowserMultiFormatReader = new BrowserMultiFormatReader();
  controls: IScannerControls | null = null; // Control para detener el escaneo
  resultText: string = '';
  scanning: boolean = false;

  ngOnInit(): void {}

  startScanning(): void {
    this.scanning = true;

    // Selecciona todos los formatos posibles para decodificar
    const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128, BarcodeFormat.EAN_13];

    // Llama al método estático listVideoInputDevices de BrowserMultiFormatReader
    BrowserMultiFormatReader.listVideoInputDevices().then((videoInputDevices: MediaDeviceInfo[]) => {
      if (videoInputDevices.length > 0) {
        const selectedDeviceId = videoInputDevices[0].deviceId;

        // Comienza a decodificar desde el video seleccionado
        this.codeReader.decodeFromVideoDevice(selectedDeviceId, this.videoElement.nativeElement, (result, error) => {
          if (result) {
            this.resultText = result.getText();//donde se guardara el numero del codigo escaneado
            console.log('Código detectado:', this.resultText);
            this.stopScanning(); // Detener el escaneo después de detectar un código
          }
          if (error) {
            console.error('Error de escaneo:', error);
          }
        }).then((controls) => {
          this.controls = controls; // Guarda el control para detener el escaneo
        });
      }
    }).catch((err) => {
      console.error('Error al acceder a la cámara:', err);
    });
  }

  stopScanning(): void {
    if (this.controls) {
      this.controls.stop(); // Detener el escaneo usando los controles de ZXing
    }
    this.scanning = false;
  }

  printCode(): void {
    const printWindow: Window | null = window.open('', '', 'height=400,width=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Imprimir Código</title></head><body>');
      printWindow.document.write('<h1>Código Detectado</h1>');
      printWindow.document.write('<p>' + this.resultText + '</p>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    } else {
      console.error('No se pudo abrir la ventana de impresión.');
    }
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }
}
