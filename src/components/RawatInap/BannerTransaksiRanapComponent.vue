<template>
  <Panel class="banner-transaksi mb-2">
    <div class="row align-items-center">
      <div class="col-md-4">
        <dl class="trx-dl">
          <dt>Diagnosa Sementara</dt>
          <dd>{{ datapasien?.DIAGNOSA_AWAL || '-' }}</dd>
        </dl>
      </div>
      <div class="col-md-4">
        <dl class="trx-dl">
          <dt>Cara Bayar</dt>
          <dd>
            {{ datapasien?.CARABAYAR || '-' }}
            <span v-if="datapasien?.NOSEP" class="sep-chip ml-1">{{ datapasien.NOSEP }}</span>
          </dd>
        </dl>
      </div>
      <div class="col-md-4">
        <dl class="trx-dl">
          <dt>Status Verifikasi</dt>
          <dd>
            <span v-if="sttsVerif" class="verif-badge-inline">
              <i class="pi pi-verified mr-1"></i>{{ sttsVerif }}
            </span>
            <span v-else style="font-size: 12px; opacity: 0.75">Belum diotorisasi</span>
          </dd>
        </dl>
      </div>
    </div>
  </Panel>
</template>

<script setup>
defineProps({
  datapasien: { type: Object, default: null },
  sttsVerif: { type: String, default: '' },
})
</script>

<style scoped>
.banner-transaksi {
  background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
  color: white;
}
.banner-transaksi :deep(.p-panel-content) {
  background: transparent;
  color: white;
  padding: 0.55rem 1rem;
}

.trx-dl {
  margin: 0;
}
.trx-dl dt {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0;
}
.trx-dl dd {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.sep-chip {
  display: inline-block;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  padding: 0 5px;
  line-height: 1.6;
}
.verif-badge-inline {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
</style>
