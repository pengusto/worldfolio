(() => {
  const originalProjectTexture = /\/models\/projects\/[^/]+\/floorTexture\.(?:png|webp|jpe?g)(?:[?#]|$)/i;
  const imageSource = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (imageSource?.set && imageSource.get) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: imageSource.configurable,
      enumerable: imageSource.enumerable,
      get: imageSource.get,
      set(value) {
        const nextValue = originalProjectTexture.test(String(value)) ? './models/matcaps/black.png' : value;
        imageSource.set.call(this, nextValue);
      },
    });
  }

  document.documentElement.dataset.personalizationSafe = 'true';
})();
