const UPSCALE_MODEL_ID = "Xenova/swin2SR-classical-sr-x2-64";

let upscalerPromise = null;
let rawImagePromise = null;

const loadLib = async () => {
  const lib = await import("@huggingface/transformers");
  lib.env.allowLocalModels = false;
  lib.env.useBrowserCache = true;
  return lib;
};

export const loadUpscaler = (progressCallback) => {
  if (!upscalerPromise) {
    upscalerPromise = loadLib()
      .then(({ pipeline }) =>
        pipeline("image-to-image", UPSCALE_MODEL_ID, {
          progress_callback: progressCallback
        })
      )
      .catch((err) => {
        upscalerPromise = null;
        throw err;
      });
  }
  return upscalerPromise;
};

export const getRawImage = () => {
  if (!rawImagePromise) {
    rawImagePromise = loadLib().then(({ RawImage }) => RawImage);
  }
  return rawImagePromise;
};
