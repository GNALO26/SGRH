<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
    public function generateAttendanceExport($attendances, string $employeeName = '')
    {
        $pdf = Pdf::loadView('pdf.attendances', [
            'attendances'   => $attendances,
            'employeeName'  => $employeeName,
        ]);
        $pdf->setPaper('A4', 'portrait');

        // Numérotation des pages
        $pdf->output();
        $domPdf = $pdf->getDomPDF();
        $canvas = $domPdf->getCanvas();
        $canvas->page_text(520, 820, "Page {PAGE_NUM} / {PAGE_COUNT}", null, 10, [0,0,0]);

        return $pdf->download('presences.pdf');
    }
}