// Skema tunggal "Pemeriksaan Fisik" (survey sistemik) dipakai bersama oleh
// form input (KajianAwalDPJPView) dan tampilan read-only (RMEKajianAwalDokterSection)
// supaya organ/field/opsi baru cukup ditambahkan di satu tempat.
export function createSecondarySurveyList() {
  return [
    {
      id: 1,
      organ: 'kepala',
      label: 'Kepala',
      kondisi: 'Dalam batas normal',
      fields: { kondisi: [], lainnya: '' },
      schemaFields: [
        {
          key: 'kondisi',
          label: 'Kondisi',
          type: 'checkbox',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'mikrosefali', label: 'Mikrosefali' },
            { value: 'makrosefali', label: 'Makrosefali' },
          ],
        },
        { key: 'lainnya', label: 'Lainnya', type: 'text' },
      ],
    },
    {
      id: 2,
      organ: 'mata',
      label: 'Mata',
      kondisi: 'Dalam batas normal',
      fields: {
        anemis_ka: '',
        anemis_ki: '',
        kondisi: [],
        bentuk_pupil: '',
        diameter_pupil_ka: '',
        diameter_pupil_ki: '',
        refleks_cahaya_ka: '',
        refleks_cahaya_ki: '',
        oedem: '',
        infeksi: '',
      },
      schemaFields: [
        {
          key: 'anemis_ka',
          label: 'Anemis kanan',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'anemis_ki',
          label: 'Anemis kiri',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'oedem',
          label: 'Oedem',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'infeksi',
          label: 'Infeksi',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'kondisi',
          label: 'Kondisi',
          type: 'checkbox',
          options: [{ value: 'sklera_ikterik', label: 'Sklera ikterik' }],
        },
        {
          key: 'bentuk_pupil',
          label: 'Pupil',
          type: 'radio',
          options: [
            { value: 'isokor', label: 'Isokor' },
            { value: 'anisokor', label: 'Anisokor' },
          ],
        },
        { key: 'diameter_pupil_ka', label: 'Ø pupil kanan (mm)', type: 'text' },
        { key: 'diameter_pupil_ki', label: 'Ø pupil kiri (mm)', type: 'text' },
      ],
    },
    {
      id: 3,
      organ: 'tht',
      label: 'THT',
      kondisi: 'Dalam batas normal',
      fields: { telinga: '', hidung: '', tonsil: '', faring: '', lidah: '', bibir: '', beslag: '' },
      schemaFields: [
        { key: 'telinga', label: 'Telinga', type: 'text' },
        { key: 'hidung', label: 'Hidung', type: 'text' },
        { key: 'tonsil', label: 'Tonsil', type: 'text' },
        { key: 'faring', label: 'Faring', type: 'text' },
        { key: 'lidah', label: 'Lidah', type: 'text' },
        { key: 'bibir', label: 'Bibir', type: 'text' },
        { key: 'beslag', label: 'Beslag', type: 'text' },
      ],
    },
    {
      id: 4,
      organ: 'leher',
      label: 'Leher',
      kondisi: 'Dalam batas normal',
      fields: { jvp: '', pembesaran_kelenjar: '', kaku_kuduk: '' },
      schemaFields: [
        { key: 'jvp', label: 'JVP', type: 'text' },
        { key: 'pembesaran_kelenjar', label: 'Pembesaran kelenjar', type: 'text' },
        {
          key: 'kaku_kuduk',
          label: 'Kaku kuduk',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
      ],
    },
    {
      id: 5,
      organ: 'thorax',
      label: 'Thorax',
      kondisi: 'Dalam batas normal',
      fields: { bentuk: '', stem_fremitus: '', perkusi_thorax: '' },
      schemaFields: [
        {
          key: 'bentuk',
          label: 'Inspeksi',
          type: 'radio',
          options: [
            { value: 'simetris', label: 'Simetris' },
            { value: 'asimetris', label: 'Asimetris' },
          ],
        },
        { key: 'stem_fremitus', label: 'Stem fremitus', type: 'text' },
        { key: 'perkusi_thorax', label: 'Perkusi', type: 'text' },
      ],
    },
    {
      id: 6,
      organ: 'cor',
      label: 'Cor',
      kondisi: 'Dalam batas normal',
      fields: { bunyi_jantung: '', irama: '', murmur: '' },
      schemaFields: [
        { key: 'bunyi_jantung', label: 'S1, S2', type: 'text' },
        {
          key: 'irama',
          label: 'Irama',
          type: 'radio',
          options: [
            { value: 'reguler', label: 'Reguler' },
            { value: 'ireguler', label: 'Ireguler' },
          ],
        },
        {
          key: 'murmur',
          label: 'Murmur',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
      ],
    },
    {
      id: 7,
      organ: 'pulmo',
      label: 'Pulmo',
      kondisi: 'Dalam batas normal',
      fields: { suara_napas: '', ronkhi_ka: '', ronkhi_ki: '', wheezing_ka: '', wheezing_ki: '' },
      schemaFields: [
        {
          key: 'suara_napas',
          label: 'Suara napas',
          type: 'radio',
          options: [
            { value: 'vesikuler', label: 'Vesikuler' },
            { value: 'bronkial', label: 'Bronkial' },
            { value: 'melemah', label: 'Melemah' },
          ],
        },
        {
          key: 'ronkhi_ka',
          label: 'Ronkhi kanan',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'ronkhi_ki',
          label: 'Ronkhi kiri',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'wheezing_ka',
          label: 'Wheezing kanan',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'wheezing_ki',
          label: 'Wheezing kiri',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
      ],
    },
    {
      id: 8,
      organ: 'abdomen',
      label: 'Abdomen',
      kondisi: 'Dalam batas normal',
      fields: {
        soepel: '',
        distensi: '',
        perkusi_abdomen: '',
        peristaltik: '',
        nyeri_tekan: '',
        lokasi_nyeri_tekan: [],
        defans_muscular: '',
        asites: '',
        meteorismus: '',
        hepar: '',
        hepar_keterangan: '',
        lien: '',
        lien_keterangan: '',
      },
      schemaFields: [
        {
          key: 'soepel',
          label: 'Inspeksi',
          type: 'radio',
          options: [
            { value: 'soepel', label: 'Soepel' },
            { value: 'distensi', label: 'Distensi' },
            { value: 'cembung', label: 'Cembung' },
          ],
        },
        { key: 'distensi', label: 'Distensi (ket.)', type: 'text' },
        {
          key: 'nyeri_tekan',
          label: 'Nyeri tekan',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'defans_muscular',
          label: 'Defans muscular',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'lokasi_nyeri_tekan',
          label: 'Lokasi NT',
          type: 'checkbox',
          options: [
            { value: 'epigastrium', label: 'Epigastrium' },
            { value: 'hipokondrium_ka', label: 'Hipokondrium Ka' },
            { value: 'hipokondrium_ki', label: 'Hipokondrium Ki' },
            { value: 'umbilikal', label: 'Umbilikal' },
            { value: 'lumbal_ka', label: 'Lumbal Ka' },
            { value: 'lumbal_ki', label: 'Lumbal Ki' },
            { value: 'hipogastrium', label: 'Hipogastrium' },
            { value: 'iliaka_ka', label: 'Iliaka Ka' },
            { value: 'iliaka_ki', label: 'Iliaka Ki' },
          ],
        },
        {
          key: 'perkusi_abdomen',
          label: 'Perkusi',
          type: 'radio',
          options: [
            { value: 'tympani', label: 'Tympani' },
            { value: 'hipertympani', label: 'Hipertympani' },
            { value: 'redup', label: 'Redup' },
            { value: 'pekak', label: 'Pekak' },
          ],
        },
        {
          key: 'peristaltik',
          label: 'Peristaltik',
          type: 'radio',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'meningkat', label: 'Meningkat' },
            { value: 'menurun', label: 'Menurun' },
          ],
        },
        {
          key: 'asites',
          label: 'Asites',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'meteorismus',
          label: 'Meteorismus',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'hepar',
          label: 'Hepar',
          type: 'radio',
          options: [
            { value: 'tidak_teraba', label: 'Tidak teraba' },
            { value: 'teraba', label: 'Teraba membesar' },
          ],
        },
        { key: 'hepar_keterangan', label: 'Hepar (ket.)', type: 'text' },
        {
          key: 'lien',
          label: 'Lien',
          type: 'radio',
          options: [
            { value: 'tidak_teraba', label: 'Tidak teraba' },
            { value: 'teraba', label: 'Teraba membesar' },
          ],
        },
        { key: 'lien_keterangan', label: 'Lien (ket.)', type: 'text' },
      ],
    },
    {
      id: 9,
      organ: 'genitalia',
      label: 'Genitalia',
      kondisi: 'Dalam batas normal',
      fields: { keterangan: '' },
      schemaFields: [{ key: 'keterangan', label: 'Keterangan', type: 'text' }],
    },
    {
      id: 10,
      organ: 'extremitas',
      label: 'Extremitas',
      kondisi: 'Dalam batas normal',
      fields: {
        akral: '',
        edema: '',
        crt: '',
        kekuatan_ka_atas: '',
        kekuatan_ki_atas: '',
        kekuatan_ka_bawah: '',
        kekuatan_ki_bawah: '',
        lain_lain: '',
      },
      schemaFields: [
        {
          key: 'akral',
          label: 'Akral',
          type: 'radio',
          options: [
            { value: 'hangat', label: 'Hangat' },
            { value: 'dingin', label: 'Dingin' },
          ],
        },
        {
          key: 'edema',
          label: 'Edema',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        { key: 'crt', label: 'CRT', type: 'text' },
        {
          key: 'kekuatan_ka_atas',
          label: 'Motorik Ka atas',
          type: 'radio',
          options: [
            { value: '0', label: '0' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' },
          ],
        },
        {
          key: 'kekuatan_ki_atas',
          label: 'Motorik Ki atas',
          type: 'radio',
          options: [
            { value: '0', label: '0' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' },
          ],
        },
        {
          key: 'kekuatan_ka_bawah',
          label: 'Motorik Ka bawah',
          type: 'radio',
          options: [
            { value: '0', label: '0' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' },
          ],
        },
        {
          key: 'kekuatan_ki_bawah',
          label: 'Motorik Ki bawah',
          type: 'radio',
          options: [
            { value: '0', label: '0' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '4', label: '4' },
            { value: '5', label: '5' },
          ],
        },
        { key: 'lain_lain', label: 'Lain-lain', type: 'text' },
      ],
    },
    {
      id: 12,
      organ: 'kulit',
      label: 'Kulit',
      kondisi: 'Dalam batas normal',
      fields: {
        warna: '',
        turgor: '',
        sianosis: '',
        ikterik: '',
        lesi: '',
        lesi_keterangan: '',
      },
      schemaFields: [
        { key: 'warna', label: 'Warna kulit', type: 'text' },
        {
          key: 'turgor',
          label: 'Turgor',
          type: 'radio',
          options: [
            { value: 'baik', label: 'Baik' },
            { value: 'menurun', label: 'Menurun' },
          ],
        },
        {
          key: 'sianosis',
          label: 'Sianosis',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'ikterik',
          label: 'Ikterik',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        {
          key: 'lesi',
          label: 'Lesi',
          type: 'radio',
          options: [
            { value: 'positif', label: '+' },
            { value: 'negatif', label: '-' },
          ],
        },
        { key: 'lesi_keterangan', label: 'Lesi (ket.)', type: 'text' },
      ],
    },
    {
      id: 11,
      organ: 'status_lokalis',
      label: 'Status Lokalis',
      kondisi: 'Dalam batas normal',
      fields: { regio: '', inspeksi: '', palpasi: '', perkusi: '', auskultasi: '' },
      schemaFields: [
        { key: 'regio', label: 'Regio', type: 'text' },
        { key: 'inspeksi', label: 'Inspeksi (I)', type: 'text' },
        { key: 'palpasi', label: 'Palpasi (P)', type: 'text' },
        { key: 'perkusi', label: 'Perkusi (P)', type: 'text' },
        { key: 'auskultasi', label: 'Auskultasi (A)', type: 'text' },
      ],
    },
  ]
}

// Label organ, keyed by slug. Dipakai tampilan read-only (RME) yang tidak butuh schemaFields penuh.
export function buildOrganLabels() {
  return Object.fromEntries(createSecondarySurveyList().map((item) => [item.organ, item.label]))
}

// schemaFields per organ, keyed by slug lalu oleh field key — untuk menerjemahkan
// value mentah (mis. 'positif') ke label yang ditampilkan ke user (mis. '+').
export function buildFieldSchemaMap() {
  return Object.fromEntries(
    createSecondarySurveyList().map((item) => [
      item.organ,
      Object.fromEntries(item.schemaFields.map((sf) => [sf.key, sf])),
    ]),
  )
}
