import { FC } from "react";

export const HomePage: FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh', // full viewport height
        backgroundImage: 'url(photos/beb.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};
