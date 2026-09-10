import { prefixer } from 'stylis';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

/**
 * Creates a caching mechanism for handling right-to-left (RTL) styling in a Material-UI theme.
 * 
 * This cache is configured with a unique key (`mui-rtl`) and uses Stylis plugins to process
 * styles for RTL layouts. The `prefixer` plugin ensures proper vendor prefixing, and the
 * `rtlPlugin` transforms styles to support RTL text direction.
 * 
 * @constant
 */
const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export default rtlCache;