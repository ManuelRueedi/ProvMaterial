export const useShowQrCodeIcon = () => useState("showQrCodeIcon", () => false);

export const useToggleQrCodeIcon = () => {
  const showQrCodeIcon = useShowQrCodeIcon();
  const toggle = () => {
    showQrCodeIcon.value = !showQrCodeIcon.value;
  };
  return toggle;
};
