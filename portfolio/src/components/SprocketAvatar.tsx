"use client";

interface SprocketAvatarProps {
  size?: number;
  idle?: boolean;
}

export default function SprocketAvatar({ size = 96, idle = false }: SprocketAvatarProps) {
  const floatDuration = idle ? "4.8s" : "3.4s";

  return (
    <div
      className="sprocket-bot"
      style={{
        ["--bot-size" as string]: `${size}px`,
        ["--bot-float" as string]: floatDuration,
      }}
      aria-hidden="true"
    >
      <div className="sprocket-bot__halo" />
      <div className="sprocket-bot__head">
        <div className="sprocket-bot__camera sprocket-bot__camera--left" />
        <div className="sprocket-bot__camera sprocket-bot__camera--right" />
        <div className="sprocket-bot__eye sprocket-bot__eye--left" />
        <div className="sprocket-bot__eye sprocket-bot__eye--right" />
        <div className="sprocket-bot__shine" />
      </div>
      <div className="sprocket-bot__neck" />
      <div className="sprocket-bot__body">
        <div className="sprocket-bot__panel" />
        <div className="sprocket-bot__leds">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="sprocket-bot__wheel sprocket-bot__wheel--left" />
      <div className="sprocket-bot__wheel sprocket-bot__wheel--right" />
    </div>
  );
}
