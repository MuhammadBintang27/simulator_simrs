<template>
  <section class="content">
    <ContentHeader title="Penyewaan" icon="pi pi-objects-column"></ContentHeader>
    <Panel>
      <div class="row">
        <div
          v-for="(data, index) in carData"
          :key="index"
          class="col-md-6 card rental-card hover-card"
        >
          <!-- Car Image Section -->
          <div class="car-image-container">
            <img :src="data.imageUrl" alt="Car image" class="car-image" />
          </div>

          <!-- Car Details Section -->
          <div class="card-body p-2">
            <!-- Title and Special Deal Tag -->
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h3 class="m-0 font-weight-bold">{{ data.type }}</h3>
              <span v-if="data.specialDeal"> <Tag value="Ready" severity="success"></Tag></span>
            </div>

            <!-- Car Model -->
            <p class="text-secondary mb-3">{{ data.model }}</p>

            <!-- Features Section -->
            <div class="mb-4">
              <p class="text-secondary mb-2">Features</p>
              <div class="d-flex gap-4">
                <!-- Seats Feature -->
                <div class="feature-item">
                  <i class="pi pi-users text-secondary"></i>
                  <span class="ml-2">{{ data.seats }}</span>
                </div>

                <!-- Fuel Type Feature -->
                <div class="feature-item">
                  <i class="pi pi-bolt text-secondary"></i>
                  <span class="ml-2">{{ data.fuelType }}</span>
                </div>

                <!-- Mileage Feature -->
                <div class="feature-item">
                  <i class="pi pi-chart-line text-secondary"></i>
                  <span class="ml-2">{{ data.mileage }}</span>
                </div>
              </div>
            </div>

            <!-- Price and Reserve Button -->
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h4 class="m-0 font-weight-bold">Rp {{ data.pricePerDay }} k</h4>
                <small class="text-secondary">Per Hari</small>
              </div>
              <Button
                label="Reserve deal"
                class="p-button-rounded p-button-danger reserve-button round-button2"
                @click="reserveCar"
              />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  </section>
</template>
<script>
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  name: 'CarRentalCard',

  setup() {
    const carData = reactive([
      {
        type: 'Standard',
        model: 'Tesla Model S',
        imageUrl:
          'http://127.0.0.1:8000/storage/uploads/iFRKFw8crIS4kqFxFCSpCde7BLKQ6gBvlIMaa48B.jpg', // Replace with actual image path
        seats: 5,
        fuelType: 'Electric',
        mileage: 'Unlimited mileage',
        pricePerDay: 400,
        specialDeal: true,
      },
      {
        type: 'Standard',
        model: 'Tesla Model S',
        imageUrl:
          'http://127.0.0.1:8000/storage/uploads/iFRKFw8crIS4kqFxFCSpCde7BLKQ6gBvlIMaa48B.jpg', // Replace with actual image path
        seats: 5,
        fuelType: 'Electric',
        mileage: 'Unlimited mileage',
        pricePerDay: 400,
        specialDeal: true,
      },
      {
        type: 'Standard',
        model: 'Tesla Model S',
        imageUrl:
          'http://127.0.0.1:8000/storage/uploads/iFRKFw8crIS4kqFxFCSpCde7BLKQ6gBvlIMaa48B.jpg', // Replace with actual image path
        seats: 5,
        fuelType: 'Electric',
        mileage: 'Unlimited mileage',
        pricePerDay: 400,
        specialDeal: true,
      },
      {
        type: 'Standard',
        model: 'Tesla Model S',
        imageUrl:
          'http://127.0.0.1:8000/storage/uploads/iFRKFw8crIS4kqFxFCSpCde7BLKQ6gBvlIMaa48B.jpg', // Replace with actual image path
        seats: 5,
        fuelType: 'Electric',
        mileage: 'Unlimited mileage',
        pricePerDay: 400,
        specialDeal: true,
      },
      {
        type: 'Standard',
        model: 'Tesla Model S',
        imageUrl:
          'http://127.0.0.1:8000/storage/uploads/iFRKFw8crIS4kqFxFCSpCde7BLKQ6gBvlIMaa48B.jpg', // Replace with actual image path
        seats: 5,
        fuelType: 'Electric',
        mileage: 'Unlimited mileage',
        pricePerDay: 400,
        specialDeal: true,
      },
      {
        type: 'Standard',
        model: 'Tesla Model S',
        imageUrl:
          'http://127.0.0.1:8000/storage/uploads/iFRKFw8crIS4kqFxFCSpCde7BLKQ6gBvlIMaa48B.jpg', // Replace with actual image path
        seats: 5,
        fuelType: 'Electric',
        mileage: 'Unlimited mileage',
        pricePerDay: 400,
        specialDeal: true,
      },
    ])

    const reserveCar = () => {
      // Add reservation logic here
      console.log('Car reserved:', carData.model)
    }

    return {
      carData,
      reserveCar,
    }
  },
})
</script>

<style scoped>
.rental-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  max-width: 320px;
}

.car-image-container {
  width: 100%;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
}

.car-image {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.special-deal-tag {
  background-color: rgba(75, 192, 128, 0.15);
  color: #4bc080;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
}

.reserve-button {
  background-color: #ff5722;
  border: none;
  padding: 0.5rem 1.5rem;
}

.gap-4 {
  gap: 1rem;
}

.hover-card {
  transition: all 0.1s ease;
}
.hover-card:hover {
  background-color: #f3f4f6; /* Light gray background */
  transform: scale(1.02); /* Slight zoom effect */
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); /* Shadow effect */
}
</style>
