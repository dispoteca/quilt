import { objectSpread2 as _objectSpread2 } from './_virtual/_rollupPluginBabelHelpers.js';
import { resolve } from 'path';
import { runInNewContext } from 'vm';

const DEFAULT_PACKAGES_TO_PROCESS = {
  '@shopify/web-worker': [{
    name: 'createWorkerFactory',
    plain: false
  }, {
    name: 'createPlainWorkerFactory',
    plain: true
  }],
  '@shopify/react-web-worker': [{
    name: 'createWorkerFactory',
    plain: false
  }, {
    name: 'createPlainWorkerFactory',
    plain: true
  }]
};
const loader = resolve(__dirname, 'webpack-parts/loader');
function workerBabelPlugin({
  types: t,
  template
}) {
  const noopBinding = template(`() => (
      new Proxy(
        {},
        {
          get() {
            return () => {
              throw new Error('You can’t call a method on a noop worker');
            };
          },
        },
      )
    );`, {
    sourceType: 'module'
  });
  return {
    visitor: {
      Program(program, state) {
        state.program = program;
        const packages = state.opts && state.opts.packages ? normalize(state.opts.packages) : DEFAULT_PACKAGES_TO_PROCESS;
        state.process = new Map(Object.entries(packages));
      },

      ImportDeclaration(importDeclaration, state) {
        const processImports = state.process.get(importDeclaration.node.source.value);

        if (processImports == null) {
          return;
        }

        for (const specifier of importDeclaration.get('specifiers')) {
          if (!specifier.isImportSpecifier()) {
            continue;
          }

          const imported = specifier.get('imported');
          const importedName = imported.node.name;
          const processableImport = processImports.find(({
            name
          }) => name === importedName);

          if (processableImport == null) {
            continue;
          }

          const binding = specifier.scope.getBinding(imported.node.name);

          if (binding == null) {
            continue;
          }

          processBinding(binding, processableImport, state);
        }
      }

    }
  };

  function processBinding(binding, importOptions, state) {
    const {
      program,
      opts: options = {}
    } = state;
    const {
      noop = false
    } = options;
    const callingReferences = binding.referencePaths.filter(referencePath => referencePath.parentPath.isCallExpression());

    for (const referencePath of callingReferences) {
      const callExpression = referencePath.parentPath;
      const dynamicImports = new Set();
      callExpression.traverse({
        Import({
          parentPath
        }) {
          if (parentPath.isCallExpression()) {
            dynamicImports.add(parentPath);
          }
        }

      });

      if (dynamicImports.size === 0) {
        return;
      }

      if (dynamicImports.size > 1) {
        throw new Error('You made more than one dynamic import in the body of a web worker create function. Only one such import is allowed.');
      }

      const dynamicallyImported = [...dynamicImports][0].get('arguments')[0];
      const {
        value: imported,
        confident
      } = dynamicallyImported.evaluate();

      if (typeof imported !== 'string' || !confident) {
        throw new Error(`Failed to evaluate a dynamic import to a string to create a web worker (${dynamicallyImported.getSource()})`);
      }

      if (noop) {
        callExpression.replaceWith(noopBinding());
        return;
      }

      const {
        leadingComments
      } = dynamicallyImported.node;

      const _options = _objectSpread2(_objectSpread2({}, getLoaderOptions(leadingComments || [])), {}, {
        plain: importOptions.plain
      });

      const importId = callExpression.scope.generateUidIdentifier('worker');
      program.get('body')[0].insertBefore(t.importDeclaration([t.importDefaultSpecifier(importId)], t.stringLiteral(`${loader}?${JSON.stringify(_options)}!${imported}`)));
      callExpression.replaceWith(t.callExpression(callExpression.get('callee').node, [importId]));
    }
  }
}
// Reduced replication of webpack’s logic for parsing import comments:
// https://github.com/webpack/webpack/blob/5147aed90ec8cd3633b0c45583f02afd16c7888d/lib/JavascriptParser.js#L2799-L2820
const webpackCommentRegExp = new RegExp(/(^|\W)webpack[A-Z]{1,}[A-Za-z]{1,}:/);

function getLoaderOptions(comments) {
  return comments.reduce((options, comment) => {
    const {
      value
    } = comment;

    if (!value || !webpackCommentRegExp.test(value)) {
      return options;
    }

    try {
      const {
        webpackChunkName: name
      } = runInNewContext(`(function(){return {${value}};})()`);
      return name ? _objectSpread2(_objectSpread2({}, options), {}, {
        name
      }) : options;
    } catch (_unused) {
      return options;
    }
  }, {});
}

function normalize(packages) {
  return Object.keys(packages).reduce((all, pkg) => _objectSpread2(_objectSpread2({}, all), {}, {
    [pkg]: packages[pkg].map(anImport => typeof anImport === 'string' ? {
      name: anImport,
      plain: false
    } : anImport)
  }), {});
}

export default workerBabelPlugin;
