import { Component, Input, OnInit } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { UploadService } from './services/upload/upload.service';

class Error {
    error: string = '';
}

class Response{
    mensaje: string = '';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    
    public pdfSrc = '/assets/VMLcorredores.pdf';
    public pdf: PDFDocumentProxy;
    public dragPosition = {x: 0, y: 0};
    public dragDroppables: any[];
    public page = 1;
    public totalPages: number = 0;
    public showSign: boolean = false;
    @Input() props: [{ [key: string]: object | any }];

    constructor(
        private uploadService: UploadService
    ) {
        
    }

    ngOnInit(): void {
        this.dragDroppables = this.props;
    }

    // procesar la firma y enviarla al backend.
    public sign(){
        window.scrollTo(0,0);
        setTimeout( async () => {

            const imgWidth = 572; // definir el ancho del canvas.
            let canvas = await this.createCanvas(); // crear el canvas.
            let imgHeight = canvas.height * imgWidth / canvas.width; 
            const contentDataURL = canvas.toDataURL('image/png', 1.0); // convertir canvas a contenido de datos.
            imgHeight > 1430 ? imgHeight = 1430 : ''; // definir alto del canvas, para evitar desbordamientos.
            // Crear pdf vacío,
            const pdf = new jsPDF({
                orientation: "p",
                unit: "px",
                format: 'a4',
            });
            pdf.addImage(contentDataURL, 'PNG', -125, 0, imgWidth, imgHeight); // agregar imagen al pdf creado.
            var blob = pdf.output("blob"); // preparar pdf para enviar.
            var fd = new FormData();
            fd.append('page', blob); // agregar el pdf al formulario.
            fd.append('numPage', this.page.toString()); // agregar la página que se firmo.
            this.sendDocumentSigned(fd); // enviar firma

        }, 1000);
    }

    // procesar envio de la firma
    sendDocumentSigned(fd: FormData): void {
        this.uploadService.uploadDocument(fd).subscribe(
            data => this.handleResponse(data),
            err => this.handleError(err)
        );
    }

    // manejar respuesta correcta del documento firmado
    handleResponse(data: Response): void {
        this.showSign = false;
        alert(data.mensaje);
    }

    // manejar respuesta en caso de error al guardar documento firmado
    handleError(err: Error): void {
        alert(err.error);
    }

    // Funcion para crear canvas del pdf con la firma.
    createCanvas(): Promise<HTMLCanvasElement> {
        return html2canvas(document.getElementById('pdf-sign'), {
            scrollY: -window.scrollY, logging: true, allowTaint: false, useCORS: true,  scale: 3
            }
        );
    }

    // Funcion para leer propiedades del pdf despues de cargar.
    public loadComplete(pdf: PDFDocumentProxy): void {
        this.pdf = pdf;
        this.totalPages = pdf.numPages;
    }

    // Avanzar una pagina del pdf.
    nextPage(): void {
        this.page++;
    }

    // Devolver una pagina del pdf cargado.
    backPage(): void {
        this.page = this.page - 1;
    }

    // Funcion para mostrar o no mostrar la firma.
    showSignF(): void {
        this.showSign = !this.showSign;
    }

}
