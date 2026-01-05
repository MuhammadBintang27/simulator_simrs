<template>
  <section class="content">
    <div class="table-container" style="background: #f8f9fa">
      <table class="table hover">
        <thead>
          <tr>
            <th>Name/ID</th>
            <th>Position</th>
            <th>Team</th>
            <th>BDay</th>
            <th>E-mail / Mobile</th>
            <th>Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(employee, index) in employees" :key="index">
            <tr>
              <td @click="toggleRow(index)">
                <span class="name">{{ employee.name }}</span
                ><br />
                <span class="id">{{ employee.id }}</span>
              </td>
              <td>{{ employee.position }}</td>
              <td>{{ employee.team }}</td>
              <td>{{ employee.bday }}</td>
              <td>
                <a :href="'mailto:' + employee.email">{{ employee.email }}</a
                ><br />
                {{ employee.mobile }}
              </td>
              <td>{{ employee.address }}</td>
              <td>{{ employee.status }}</td>
            </tr>

            <tr v-if="expandedRow === index" class="expandable-row">
              <td colspan="7">
                <div class="details" style="background-color: aliceblue">
                  <label>First Name: <InputText v-model="employees[index].name" /></label>
                  <label>Position: <input type="text" v-model="employees[index].position" /></label>
                  <label>Team: <input type="number" v-model="employees[index].team" /></label>
                  <label>Email: <input type="email" v-model="employees[index].email" /></label>
                  <label>Mobile: <input type="text" v-model="employees[index].mobile" /></label>
                  <label>Address: <input type="text" v-model="employees[index].address" /></label>
                  <Button @click="saveChanges(index)">Save</Button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      expandedRow: null,
      employees: [
        {
          id: 163,
          name: 'Selivanova Vera',
          position: 'Designer',
          team: 15,
          bday: 'Aug 15, 1986',
          email: 'abramov@gmail.com',
          mobile: '+375(29)-298-44-44',
          address: 'Minsk, Pobedy St. 135',
          status: 'Full-time',
        },
        {
          id: 103,
          name: 'Abramov Andrey',
          position: 'Product Manager',
          team: 10,
          bday: 'Apr 20, 1987',
          email: 'abramov@gmail.com',
          mobile: '+375(29)-298-44-44',
          address: 'Minsk, Pobedy St. 135',
          status: 'Full-time',
        },
        {
          id: 163,
          name: 'Durov Dmitriy',
          position: 'Designer',
          team: 33,
          bday: 'Apr 10, 1988',
          email: 'abramov@gmail.com',
          mobile: '+375(29)-298-44-44',
          address: 'Minsk, Dzerzhinskogo 47',
          status: 'Full-time',
        },
        {
          id: 108,
          name: 'Antonov Maksim',
          position: 'Product Manager',
          team: 21,
          bday: 'Dec 28, 1984',
          email: 'abramov@gmail.com',
          mobile: '+375(29)-298-44-44',
          address: 'Minsk, Pobedy St. 135',
          status: 'Full-time',
        },
      ],
    }
  },
  methods: {
    toggleRow(index) {
      this.expandedRow = this.expandedRow === index ? null : index
    },
    saveChanges(index) {
      alert('Changes saved for ' + this.employees[index].name)
      this.expandedRow = null
    },
  },
}
</script>

<style>
table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
th,
tr:hover {
  background: #f1f1f1;
}
.name {
  font-weight: bold;
  color: #007bff;
}
.id {
  font-size: 12px;
  color: gray;
}
.expandable-row td {
  background: #f9f9f9;
}
.details {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.details label {
  margin-bottom: 5px;
  font-weight: bold;
}
.details input {
  padding: 5px;
  width: 100%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
