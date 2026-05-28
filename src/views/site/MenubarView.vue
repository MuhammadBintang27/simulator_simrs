<template></template>

<script setup></script>

<style scoped>
/* Shell */
.nb {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1000;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  transition: box-shadow 0.2s;
}
.nb--up {
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
}

/* Inner */
.nb__wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* Logo */
.nb__logo img {
  height: 32px;
  display: block;
}

/* Nav */
.nb__nav {
  display: flex;
  gap: 0.25rem;
  flex: 1;
}
.nb__a {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s;
  letter-spacing: 0.01em;
}
.nb__a:hover {
  color: #111;
  background: #f5f5f5;
}
.nb__a.router-link-exact-active {
  color: #111;
  font-weight: 600;
}

/* Right */
.nb__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}
.nb__login {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  transition:
    color 0.15s,
    background 0.15s;
}
.nb__login:hover {
  color: #111;
  background: #f5f5f5;
}
.nb__cta {
  font-size: 0.82rem;
  font-weight: 600;
  color: #fff;
  background: #111;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.15s;
}
.nb__cta:hover {
  background: #333;
}

/* Hamburger */
.nb__ham {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: auto;
}
.nb__ham span {
  display: block;
  width: 20px;
  height: 1.5px;
  background: #374151;
  border-radius: 2px;
  transition:
    opacity 0.2s,
    transform 0.2s;
  transform-origin: center;
}
.nb__ham--x span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.nb__ham--x span:nth-child(2) {
  opacity: 0;
}
.nb__ham--x span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

/* Mobile menu */
.nb__mobile {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  padding: 0.5rem 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nb__ma {
  display: block;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  padding: 0.6rem 0.5rem;
  border-radius: 6px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}
.nb__ma:hover {
  background: #f5f5f5;
}
.nb__ma--cta {
  margin-top: 0.5rem;
  color: #fff;
  background: #111;
  text-align: center;
  border-radius: 6px;
  padding: 0.6rem;
  font-weight: 600;
}
.nb__ma--cta:hover {
  background: #333;
}

/* Transition */
.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Responsive */
@media (max-width: 768px) {
  .nb__nav,
  .nb__right {
    display: none;
  }
  .nb__ham {
    display: flex;
  }
}
</style>
