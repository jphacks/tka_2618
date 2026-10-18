declare module '*.css';

declare module 'svg-maps__common' {
  export type Location = {
    id: string;
    name: string;
    path: string;
  };

  export type Map = {
    label: string;
    viewBox: string;
    locations: Location[];
  };
}
