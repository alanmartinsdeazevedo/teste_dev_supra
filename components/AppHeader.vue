<template>
  <header class="app-header">
    <div class="header-mark">
      <Icon name="tabler:qrcode" />
    </div>
    <div>
      <h1>QR Code <span>Studio</span></h1>
      <p>Gerador de QR Codes personalizados</p>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.header-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  flex-shrink: 0;
}

h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--secondary);
  letter-spacing: -0.03em;
}

h1 span { color: var(--primary); }

p {
  color: var(--text-tertiary);
  margin: 1px 0 0;
  font-size: 0.8rem;
}
</style>
