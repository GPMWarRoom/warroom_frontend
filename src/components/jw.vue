<template>
  <div>
    {{ person.name }}
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";

class test {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

const person = reactive(new test("jw", 21));
</script>

<style scoped>
</style>