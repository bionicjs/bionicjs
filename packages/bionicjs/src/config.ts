export interface BionicJSPlugin<TName extends string = string, TExports = any> {
  name: TName;
  setup: (app: any) => void | Promise<void>;
  generateExports?: () => string | Promise<string>;
}

export type BionicJSConfig = {
  [key: string]: BionicJSPlugin | any;
};

export function defineConfig(config: BionicJSConfig): BionicJSConfig {
  return config;
}
