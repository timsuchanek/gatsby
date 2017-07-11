"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _taggedTemplateLiteral2 = require("babel-runtime/helpers/taggedTemplateLiteral");

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(["\n              Could not infer an appropriate GraphQL input type\n              for value: ", " of type ", " along path: ", "\n            "], ["\n              Could not infer an appropriate GraphQL input type\n              for value: ", " of type ", " along path: ", "\n            "]);

exports.inferInputObjectStructureFromNodes = inferInputObjectStructureFromNodes;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("graphql"),
    GraphQLInputObjectType = _require.GraphQLInputObjectType,
    GraphQLBoolean = _require.GraphQLBoolean,
    GraphQLString = _require.GraphQLString,
    GraphQLFloat = _require.GraphQLFloat,
    GraphQLInt = _require.GraphQLInt,
    GraphQLList = _require.GraphQLList,
    GraphQLEnumType = _require.GraphQLEnumType,
    GraphQLNonNull = _require.GraphQLNonNull;

var _require2 = require("common-tags"),
    oneLine = _require2.oneLine;

var _ = require("lodash");
var invariant = require("invariant");
var typeOf = require("type-of");
var createTypeName = require("./create-type-name");
var createKey = require("./create-key");

var _require3 = require("./data-tree-utils"),
    extractFieldExamples = _require3.extractFieldExamples,
    buildFieldEnumValues = _require3.buildFieldEnumValues,
    isEmptyObjectOrArray = _require3.isEmptyObjectOrArray;

function typeFields(type) {
  switch (type) {
    case "boolean":
      return {
        eq: { type: GraphQLBoolean },
        ne: { type: GraphQLBoolean }
      };
    case "string":
      return {
        eq: { type: GraphQLString },
        ne: { type: GraphQLString },
        regex: { type: GraphQLString },
        glob: { type: GraphQLString }
      };
    case "int":
      return {
        eq: { type: GraphQLInt },
        ne: { type: GraphQLInt }
      };
    case "float":
      return {
        eq: { type: GraphQLFloat },
        ne: { type: GraphQLFloat }
      };
  }
  return {};
}

function inferGraphQLInputFields(_ref) {
  var value = _ref.value,
      nodes = _ref.nodes,
      prefix = _ref.prefix;

  if (value == null || isEmptyObjectOrArray(value)) return null;

  switch (typeOf(value)) {
    case "array":
      {
        var headValue = value[0];
        var headType = typeOf(headValue);

        if (headType === "number") headType = _.isInteger(headValue) ? "int" : "float";

        // Determine type for in operator.
        var inType = void 0;
        switch (headType) {
          case "int":
            inType = GraphQLInt;
            break;
          case "float":
            inType = GraphQLFloat;
            break;
          case "string":
            inType = GraphQLString;
            break;
          case "boolean":
            inType = GraphQLBoolean;
            break;
          case "array":
          case "object":
            {
              var inferredField = inferGraphQLInputFields({
                value: headValue,
                prefix: prefix,
                nodes: nodes
              });
              invariant(inferredField, "Could not infer graphQL type for value: " + headValue);
              inType = inferredField.type;
              break;
            }
          default:
            invariant(false, oneLine(_templateObject, headValue, headType, prefix));
        }

        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(prefix + "QueryList"),
            fields: (0, _extends3.default)({}, typeFields(headType), {
              in: { type: new GraphQLList(inType) }
            })
          })
        };
      }
    case "boolean":
      {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(prefix + "QueryBoolean"),
            fields: typeFields("boolean")
          })
        };
      }
    case "string":
      {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(prefix + "QueryString"),
            fields: typeFields("string")
          })
        };
      }
    case "object":
      {
        return {
          type: new GraphQLInputObjectType({
            name: createTypeName(prefix + "InputObject"),
            fields: inferInputObjectStructureFromNodes({
              nodes: nodes,
              prefix: prefix,
              exampleValue: value
            }).inferredFields
          })
        };
      }
    case "number":
      {
        if (value % 1 === 0) {
          return {
            type: new GraphQLInputObjectType({
              name: createTypeName(prefix + "QueryInteger"),
              fields: typeFields("int")
            })
          };
        } else {
          return {
            type: new GraphQLInputObjectType({
              name: createTypeName(prefix + "QueryFloat"),
              fields: typeFields("float")
            })
          };
        }
      }
    default:
      return null;
  }
}

var EXCLUDE_KEYS = {
  parent: 1,
  children: 1
};

function inferInputObjectStructureFromNodes(_ref2) {
  var nodes = _ref2.nodes,
      _ref2$typeName = _ref2.typeName,
      typeName = _ref2$typeName === undefined ? "" : _ref2$typeName,
      _ref2$prefix = _ref2.prefix,
      prefix = _ref2$prefix === undefined ? "" : _ref2$prefix,
      _ref2$exampleValue = _ref2.exampleValue,
      exampleValue = _ref2$exampleValue === undefined ? extractFieldExamples(nodes) : _ref2$exampleValue;

  var inferredFields = {};
  var isRoot = !prefix;

  prefix = isRoot ? typeName : prefix;

  _.each(exampleValue, function (value, key) {
    // Remove fields for traversing through nodes as we want to control
    // setting traversing up not try to automatically infer them.
    if (isRoot && EXCLUDE_KEYS[key]) return;

    // Input arguments on linked fields aren't currently supported
    if (_.includes(key, "___NODE")) return;

    var field = inferGraphQLInputFields({
      nodes: nodes,
      value: value,
      prefix: "" + prefix + _.upperFirst(key)
    });

    if (field == null) return;
    inferredFields[createKey(key)] = field;
  });

  // Add sorting (but only to the top level).
  var sort = void 0;
  if (typeName) {
    var enumValues = buildFieldEnumValues(nodes);

    var SortByType = new GraphQLEnumType({
      name: typeName + "SortByFieldsEnum",
      values: enumValues
    });

    sort = {
      type: new GraphQLInputObjectType({
        name: _.camelCase(typeName + " sort"),
        fields: {
          fields: {
            name: _.camelCase(typeName + " sortFields"),
            type: new GraphQLNonNull(new GraphQLList(SortByType))
          },
          order: {
            name: _.camelCase(typeName + " sortOrder"),
            defaultValue: "asc",
            type: new GraphQLEnumType({
              name: _.camelCase(typeName + " sortOrderValues"),
              values: {
                ASC: { value: "asc" },
                DESC: { value: "desc" }
              }
            })
          }
        }
      })
    };
  }

  return { inferredFields: inferredFields, sort: sort };
}
//# sourceMappingURL=infer-graphql-input-fields.js.map