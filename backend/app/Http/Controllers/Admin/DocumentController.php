<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Services\CloudinaryService;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(
        private CloudinaryService $cloudinaryService,
        private NotificationService $notificationService
    ) {}

    public function index()
    {
        return response()->json(Document::with('employee')->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'file'        => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'type'        => 'required|string|in:contract,amendment,certificate,policy,other',
            'employee_id' => 'nullable|exists:users,id',
        ]);

        $url = $this->cloudinaryService->upload($request->file('file'), 'documents');

        $doc = Document::create([
            'title'       => $request->title,
            'file_url'    => $url,
            'type'        => $request->type,
            'employee_id' => $request->employee_id,
            'uploaded_by' => auth()->id(),
        ]);

        if ($doc->employee_id) {
            $this->notificationService->createForUser(
                $doc->employee,
                "Nouveau document : {$doc->title}",
                'fas fa-file-alt'
            );
        }

        return response()->json($doc, 201);
    }

    public function destroy(Document $document)
    {
        $document->delete();
        return response()->json(null, 204);
    }
}