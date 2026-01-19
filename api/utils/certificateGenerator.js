const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = (studentName, eventName, date, collegeName) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // Ensure directory exists
            const dirPath = path.join(__dirname, '../public/certificates');
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const fileName = `cert_${Date.now()}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            const filePath = path.join(dirPath, fileName);
            const relativePath = `/public/certificates/${fileName}`;

            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // --- Dimensions ---
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            // --- Background & Border ---
            // Outer double border
            doc.lineWidth(5)
                .rect(20, 20, pageWidth - 40, pageHeight - 40)
                .stroke('#1a237e'); // Dark Blue

            doc.lineWidth(2)
                .rect(30, 30, pageWidth - 60, pageHeight - 60)
                .stroke('#daa520'); // Gold

            // Corner Decorations (Simple triangles)
            const cornerSize = 40;
            doc.save()
            doc.fillColor('#1a237e')
                .path(`M 20 20 L ${20 + cornerSize} 20 L 20 ${20 + cornerSize} Z`)
                .path(`M ${pageWidth - 20} 20 L ${pageWidth - 20 - cornerSize} 20 L ${pageWidth - 20} ${20 + cornerSize} Z`)
                .path(`M 20 ${pageHeight - 20} L ${20 + cornerSize} ${pageHeight - 20} L 20 ${pageHeight - 20 - cornerSize} Z`)
                .path(`M ${pageWidth - 20} ${pageHeight - 20} L ${pageWidth - 20 - cornerSize} ${pageHeight - 20} L ${pageWidth - 20} ${pageHeight - 20 - cornerSize} Z`)
                .fill()
            doc.restore();


            // --- Content ---
            let yPos = 80;

            // College Name (Top)
            doc.font('Helvetica-Bold')
                .fontSize(36)
                .fillColor('#1a237e') // Dark Blue
                .text(collegeName.toUpperCase(), 0, yPos, { align: 'center', width: pageWidth });

            yPos += 50;

            // Title
            doc.font('Helvetica')
                .fontSize(24)
                .fillColor('#333333')
                .text('CERTIFICATE OF PARTICIPATION', 0, yPos, { align: 'center', width: pageWidth });

            yPos += 40;

            // Separator Line
            doc.lineWidth(1)
                .moveTo(pageWidth / 4, yPos)
                .lineTo(pageWidth * 3 / 4, yPos)
                .stroke('#999999');

            yPos += 30;

            // "Presented to"
            doc.font('Helvetica-Oblique')
                .fontSize(18)
                .fillColor('#666666')
                .text('This certificate is proudly presented to', 0, yPos, { align: 'center', width: pageWidth });

            yPos += 35;

            // Student Name
            doc.font('Helvetica-BoldOblique')
                .fontSize(42)
                .fillColor('#daa520') // Gold
                .text(studentName, 0, yPos, { align: 'center', width: pageWidth });

            yPos += 55;

            // Details
            doc.font('Helvetica')
                .fontSize(18)
                .fillColor('#333333')
                .text('For active participation and completion of the event', 0, yPos, { align: 'center', width: pageWidth });

            yPos += 30;

            // Event Name
            doc.font('Helvetica-Bold')
                .fontSize(28)
                .fillColor('#1a237e')
                .text(eventName, 0, yPos, { align: 'center', width: pageWidth });

            yPos += 40;

            // Date
            doc.font('Helvetica')
                .fontSize(16)
                .fillColor('#555555')
                .text(`Date of Event: ${new Date(date).toLocaleDateString()}`, 0, yPos, { align: 'center', width: pageWidth });

            // --- Signatures ---
            const sigY = pageHeight - 120;
            const leftSigX = 100;
            const rightSigX = pageWidth - 300;

            doc.lineWidth(1).strokeColor('#333333');

            // Left Sig Line
            doc.moveTo(leftSigX, sigY).lineTo(leftSigX + 200, sigY).stroke();
            doc.font('Helvetica-Bold').fontSize(14).text('Event Coordinator', leftSigX, sigY + 10, { width: 200, align: 'center' });

            // Right Sig Line
            doc.moveTo(rightSigX, sigY).lineTo(rightSigX + 200, sigY).stroke();
            doc.font('Helvetica-Bold').fontSize(14).text('Principal / HOD', rightSigX, sigY + 10, { width: 200, align: 'center' });

            // Footer Badge/Seal (Circle)
            doc.save();
            const badgeX = pageWidth / 2;
            const badgeY = pageHeight - 90;
            doc.circle(badgeX, badgeY, 35).lineWidth(2).stroke('#daa520');
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#daa520')
                .text('VERIFIED', badgeX - 22, badgeY - 5, { align: 'center', width: 45 });
            doc.restore();

            // End PDF
            doc.end();

            writeStream.on('finish', () => {
                resolve({ filePath, relativePath, fileName });
            });

            writeStream.on('error', (err) => {
                console.error("PDF Write Error:", err);
                reject(err);
            });

        } catch (e) {
            console.error("PDF Generation Error:", e);
            reject(e);
        }
    });
};

module.exports = generateCertificate;
