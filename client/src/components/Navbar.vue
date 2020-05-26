<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="#">
        <h1 class="title is-5">Prometna infrastruktura RS 🇸🇮</h1>
      </a>
      <a
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <!--
    <div id="navbarBasicExample" class="navbar-menu">
      <div class="navbar-start">
       
      </div>
    -->
    <div class="navbar-end">
      <a class="navbar-item">🏠 Domov</a>

      <a
        class="navbar-item"
        href="https://documenter.getpostman.com/view/11521904/SztA7UZC?version=latest"
        target="_blank"
      >⚡ API</a>

      <router-link to="/livecam" class="navbar-item">📸 Vozišča v živo</router-link>

      <a class="navbar-item">💡 O projektu</a>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavigationBar",
  data: function() {
    return {};
  }
};
</script>

<style>
</style>


