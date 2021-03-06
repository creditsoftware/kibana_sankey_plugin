/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { CoreSetup, PluginInitializerContext } from 'kibana/public';
import { ExpressionRenderDefinition } from 'src/plugins/expressions';
import { SankeyPluginStartDependencies } from '../plugin';
import { TableVisRenderValue } from '../table_vis_fn';
import { TableVisLegacyController } from './vis_controller';
import { SANKEY_VIS_NAME } from '../types';

const tableVisRegistry = new Map<HTMLElement, TableVisLegacyController>();

export const getSankeyVisLegacyRenderer: (
  core: CoreSetup<SankeyPluginStartDependencies>,
  context: PluginInitializerContext
) => ExpressionRenderDefinition<TableVisRenderValue> = (core, context) => ({
  name: SANKEY_VIS_NAME,
  reuseDomNode: true,
  render: async (domNode, config, handlers) => {
    let registeredController = tableVisRegistry.get(domNode);

    if (!registeredController) {
      const { getTableVisualizationControllerClass } = await import('./vis_controller');

      const Controller = getTableVisualizationControllerClass(core, context);
      registeredController = new Controller(domNode);
      tableVisRegistry.set(domNode, registeredController);

      handlers.onDestroy(() => {
        registeredController?.destroy();
        tableVisRegistry.delete(domNode);
      });
    }

    await registeredController.render(config.visData, config.visConfig, handlers);
    handlers.done();
  },
});
