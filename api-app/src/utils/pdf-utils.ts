/*************************************************************
 * api-app - pdf-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 24.01.22 - 17:25
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import * as PDFDocument from 'pdfkit';
import { format, parseISO } from 'date-fns';

export const generateAttachedQrPDF = async (
  qrCode: string,
  title?: string
): Promise<Buffer> => {
  const pdfBuffer: Buffer = await new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      bufferPages: true,
    });

    if (title) {
      doc.font('Helvetica-Bold').text(title, { align: 'center' });
    }
    // customize your PDF document
    doc.image(
      Buffer.from(qrCode.replace('data:image/png;base64,', ''), 'base64'),
      100
    );
    doc.end();

    const buffer = [];
    doc.on('data', buffer.push.bind(buffer));
    doc.on('end', () => {
      const data = Buffer.concat(buffer);
      resolve(data);
    });
  });

  return pdfBuffer;
};

export const generateTestResultPDF = async (
  qrCode: string,
  testResult: string,
  person: any,
  settings: any,
  testData: any
): Promise<Buffer> => {
  const pdfBuffer: Buffer = await new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      bufferPages: true,
    });

    const centerX = doc.page.width / 2;
    const startX = 50;

    doc
      .font('Helvetica')
      .circle(centerX, 27, 18)
      .lineWidth(3)
      .fillOpacity(0.8)
      .fill('#FF931E');

    doc
      .font('Helvetica-Bold')
      .fillColor('#fff')
      .fontSize(28)
      .text('Y', centerX - 9, 18, {});
    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor('#555555')
      .text('Yeta.app', centerX + 25, 22);

    doc.moveDown();
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(20).text('LOGO', startX);

    doc.moveDown();
    doc.moveDown();
    doc.moveDown();

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#000')
      .text(
        `${settings.name} | Am ${settings.address} | ${settings.postalCode} ${settings.city} | ${settings.country}`,
        startX
      );

    doc.moveDown();
    doc.moveDown();
    doc.text(`${person.firstName} ${person.secondName}`, startX);
    doc.text(`${person.address}`, startX, doc.y + 3);
    doc.text(`${person.postalCode} ${person.city}`, startX, doc.y + 3);

    doc.moveDown();
    doc.text(`${settings.city} ${format(new Date(), 'dd.MM.yyyy')}`, {
      align: 'right',
    });

    doc.moveDown();
    doc.moveDown();
    doc
      .font('Helvetica-Bold')
      .text(
        'Bescheinigung über das Vorliegen eines positiven oder negativen Testergebnisses zum Nachweis des SARS-COV-2 Virus ( Test result certification )',
        startX
      );

    doc.moveDown();
    doc.moveDown();
    let yPos = doc.y;
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Test-Art (Test type): ', startX, yPos)
      .text(`${testData.testType.key}`, centerX + startX, yPos);

    doc.moveDown();
    doc.moveDown();
    doc.moveDown();

    yPos = doc.y + 3;
    const name = `${person.firstName} ${person.secondName}`;
    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Name', startX, yPos)
      .font('Helvetica-Bold')
      .text(`${name}`, centerX + startX, yPos);

    yPos = doc.y + 3;
    const bDate = `${format(parseISO(person.birthDate), 'dd.MM.yyyy')}`;
    doc
      .font('Helvetica')
      .text('Geburtsdatum', startX, yPos)
      .font('Helvetica-Bold')
      .text(`${bDate}`, centerX + startX, yPos);

    yPos = doc.y + 3;
    doc
      .font('Helvetica')
      .text('Geschlect', startX, yPos)
      .font('Helvetica-Bold')
      .text('ToDo', centerX + startX, yPos);

    yPos = doc.y + 3;
    const cin = `${person.cin}`;
    doc
      .font('Helvetica')
      .text('Ausweis-NR', startX, yPos)
      .font('Helvetica-Bold')
      .text(`${cin}`, centerX + startX, yPos);

    yPos = doc.y + 3;
    doc
      .font('Helvetica')
      .text('Test-Kit', startX, yPos)
      .font('Helvetica-Bold')
      .text(`ToDo`, centerX + startX, yPos);

    yPos = doc.y + 3;
    doc
      .font('Helvetica')
      .text('Test-Datum', startX, yPos)
      .font('Helvetica-Bold')
      .text(`ToDo`, centerX + startX, yPos);

    doc.moveDown();
    doc.moveDown();
    doc.moveDown();

    yPos = doc.y;
    doc
      .font('Helvetica')
      .fontSize(11)
      .text('Test-Ergebnis', startX, yPos)
      .font('Helvetica')
      .text(`${testResult}`, centerX + startX, yPos);

    doc.moveDown();
    doc.moveDown();
    doc.moveDown();

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(
        'Dieser Befund wurde elektronisch erstellt und ist ohne Unterschrift gültig.',
        startX
      )
      .fillColor('#888888')
      .text(
        'This report was electronically generated and is valid without a signature',
        startX,
        doc.y + 1
      );

    doc.fillColor('#000').moveDown();
    doc.moveDown();
    doc.moveDown();
    doc.moveDown();
    // customize your PDF document
    doc.image(
      Buffer.from(qrCode.replace('data:image/png;base64,', ''), 'base64'),
      centerX
    );
    doc.end();

    const buffer = [];
    doc.on('data', buffer.push.bind(buffer));
    doc.on('end', () => {
      const data = Buffer.concat(buffer);
      resolve(data);
    });
  });

  return pdfBuffer;
};
