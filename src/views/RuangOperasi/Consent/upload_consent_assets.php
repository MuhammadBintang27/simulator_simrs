<?php
/**
 * Endpoint: Upload Tanda Tangan & Foto Consent
 * Controller: Triaseigd (atau controller terkait)
 * Method: POST /index.php/api/triaseigd/upload_consent_assets
 *
 * Cara ditempatkan:
 *   Salin method ini ke dalam controller CodeIgniter yang sesuai,
 *   misalnya application/controllers/api/Triaseigd.php
 */

public function upload_consent_assets()
{
    header('Content-Type: application/json');

    // ─── 1. Ambil payload JSON ────────────────────────────────────────────────
    $input      = json_decode(file_get_contents('php://input'), true);
    $id_client  = $input['id_client']  ?? null;
    $noregister = $input['noregister'] ?? null;
    $signers    = $input['signers']    ?? [];   // array of { hubungan, signature_b64, photo_b64 }

    if (!$id_client || !$noregister || empty($signers)) {
        echo json_encode([
            'metadata' => ['code' => '400', 'message' => 'Parameter tidak lengkap'],
        ]);
        return;
    }

    // ─── 2. Direktori penyimpanan ────────────────────────────────────────────
    // Sesuaikan path dengan struktur server Anda
    $base_dir = FCPATH . 'uploads/consent/';   // public_html/uploads/consent/
    $sig_dir  = $base_dir . 'signatures/';
    $photo_dir = $base_dir . 'photos/';

    // Buat folder jika belum ada
    foreach ([$base_dir, $sig_dir, $photo_dir] as $dir) {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    // ─── 3. Prefix nama file ─────────────────────────────────────────────────
    $safe_noreg = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $noregister);
    $timestamp  = date('YmdHis');

    // ─── 4. Proses tiap penandatangan ────────────────────────────────────────
    $result_signers = [];

    foreach ($signers as $idx => $signer) {
        $hubungan      = $signer['hubungan']      ?? 'penandatangan';
        $signature_b64 = $signer['signature_b64'] ?? null;
        $photo_b64     = $signer['photo_b64']     ?? null;

        $safe_hub  = preg_replace('/[^a-zA-Z0-9]/', '_', strtolower($hubungan));
        $file_prefix = "{$safe_noreg}_{$safe_hub}_{$timestamp}_{$idx}";

        $signature_url = null;
        $photo_url     = null;

        // ── Upload tanda tangan ──────────────────────────────────────────────
        if ($signature_b64) {
            // Hapus header data URL jika ada: "data:image/png;base64,..."
            $sig_data  = preg_replace('/^data:image\/\w+;base64,/', '', $signature_b64);
            $sig_bytes = base64_decode($sig_data);

            if ($sig_bytes !== false) {
                $sig_filename = "sig_{$file_prefix}.png";
                $sig_path     = $sig_dir . $sig_filename;

                if (file_put_contents($sig_path, $sig_bytes) !== false) {
                    // URL yang bisa diakses browser
                    $signature_url = base_url("uploads/consent/signatures/{$sig_filename}");
                }
            }
        }

        // ── Upload foto ──────────────────────────────────────────────────────
        if ($photo_b64) {
            $photo_data  = preg_replace('/^data:image\/\w+;base64,/', '', $photo_b64);
            $photo_bytes = base64_decode($photo_data);

            if ($photo_bytes !== false) {
                $photo_filename = "photo_{$file_prefix}.jpg";
                $photo_path     = $photo_dir . $photo_filename;

                if (file_put_contents($photo_path, $photo_bytes) !== false) {
                    $photo_url = base_url("uploads/consent/photos/{$photo_filename}");
                }
            }
        }

        $result_signers[] = [
            'hubungan'      => $hubungan,
            'signature_url' => $signature_url,
            'photo_url'     => $photo_url,
        ];
    }

    // ─── 5. (Opsional) Simpan log upload ke database ─────────────────────────
    // $this->db->insert('consent_assets_log', [
    //     'noregister'   => $noregister,
    //     'id_client'    => $id_client,
    //     'uploaded_at'  => date('Y-m-d H:i:s'),
    //     'jumlah_signer'=> count($result_signers),
    // ]);

    // ─── 6. Response ─────────────────────────────────────────────────────────
    echo json_encode([
        'metadata' => [
            'code'    => '200',
            'message' => 'Upload berhasil',
        ],
        'response' => [
            'signers' => $result_signers,
        ],
    ]);
}
