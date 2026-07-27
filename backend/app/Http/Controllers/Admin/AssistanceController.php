<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssistanceRequest;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AssistanceController extends Controller
{
    public function index()
    {
        $requests = AssistanceRequest::with('user')->latest()->paginate(20);

        $data = $requests->through(function ($req) {
            return [
                'id' => $req->id,
                'subject' => $req->subject,
                'description' => $req->description,
                'status' => $req->status,
                'admin_response' => $req->admin_response,
                'created_at' => $req->created_at,
                'user' => $req->user ? [
                    'id' => $req->user->id,
                    'name' => $req->user->name,
                ] : null,
            ];
        });

        return response()->json($data);
    }

    public function respond(Request $request, AssistanceRequest $assistanceRequest)
    {
        $request->validate([
            'admin_response' => 'nullable|string',
            'status' => 'required|in:open,in_progress,closed',
        ]);

        $data = [
            'admin_response' => $request->admin_response,
            'status' => $request->status,
        ];

        if ($request->status === 'closed') {
            $data['resolved_at'] = now();
        }

        $assistanceRequest->update($data);

        if ($assistanceRequest->user) {
            app(NotificationService::class)->createForUser(
                $assistanceRequest->user,
                "Votre demande d'assistance a été mise à jour",
                'fas fa-life-ring'
            );
        }

        return response()->json($assistanceRequest);
    }
}