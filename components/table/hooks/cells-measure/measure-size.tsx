import { ReactElement } from 'react';
import ReactDOMServer from 'react-dom/server';
import { IMeasurer } from '../../types';

export function createMeasurer(portalTo = document.body): IMeasurer {
  let div = document.createElement('div');
  div.style.padding = '0';
  div.style.margin = '0';
  div.style.position = 'absolute';
  portalTo.appendChild(div);
  return {
    measure(element: ReactElement, width: number) {
      div.innerHTML = ReactDOMServer.renderToStaticMarkup(element);
      div.style.width = `${width}px`;
      const _width = div.offsetWidth;
      const height = div.offsetHeight;
      div.innerHTML = '';
      return { width: _width, height };
    },
    destroy() {
      portalTo.removeChild(div);
      // @ts-ignore
      div = undefined;
    }
  };
}
