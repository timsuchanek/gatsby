import React from "react"
import Typography from "typography"
import { TypographyStyle, GoogleFont } from "react-typography"
import CodePlugin from "typography-plugin-code"

// Due to webpack wanting requires to be static, the simplest thing to do
// here is to just require all the Typography themes (they're simple objects
// so this isn't that big of load) and then match the theme name
// against what's set in the options.
const themes = {
  alton: require(`typography-theme-alton`).default,
  github: require(`typography-theme-github`).default,
  moraga: require(`typography-theme-moraga`).default,
  sutro: require(`typography-theme-sutro`).default,
  "wordpress-2013": require(`typography-theme-wordpress-2013`).default,
  bootstrap: require(`typography-theme-bootstrap`).default,
  "grand-view": require(`typography-theme-grand-view`).default,
  noriega: require(`typography-theme-noriega`).default,
  "twin-peaks": require(`typography-theme-twin-peaks`).default,
  "wordpress-2014": require(`typography-theme-wordpress-2014`).default,
  "de-young": require(`typography-theme-de-young`).default,
  irving: require(`typography-theme-irving`).default,
  "ocean-beach": require(`typography-theme-ocean-beach`).default,
  "us-web-design-standards": require(`typography-theme-us-web-design-standards`)
    .default,
  "wordpress-2015": require(`typography-theme-wordpress-2015`).default,
  doelger: require(`typography-theme-doelger`).default,
  judah: require(`typography-theme-judah`).default,
  parnassus: require(`typography-theme-parnassus`).default,
  wikipedia: require(`typography-theme-wikipedia`).default,
  "wordpress-2016": require(`typography-theme-wordpress-2016`).default,
  "elk-glen": require(`typography-theme-elk-glen`).default,
  kirkham: require(`typography-theme-kirkham`).default,
  "st-annes": require(`typography-theme-st-annes`).default,
  "wordpress-2010": require(`typography-theme-wordpress-2010`).default,
  "wordpress-kubrick": require(`typography-theme-wordpress-kubrick`).default,
  "fairy-gates": require(`typography-theme-fairy-gates`).default,
  lawton: require(`typography-theme-lawton`).default,
  "stern-grove": require(`typography-theme-stern-grove`).default,
  "wordpress-2011": require(`typography-theme-wordpress-2011`).default,
  funston: require(`typography-theme-funston`).default,
  lincoln: require(`typography-theme-lincoln`).default,
  "stow-lake": require(`typography-theme-stow-lake`).default,
  "wordpress-2012": require(`typography-theme-wordpress-2012`).default,
}
exports.onRenderBody = ({ setHeadComponents }, pluginOptions) => {
  // TODO use pluginOptions. Log warning if we can't find a
  // theme and just use default at that point.
  // TODO add option to use typography module elsewhere e.g. utils/typography.js — just write out little module to include that then in gatsby-node.js and then try/catch require it here?
  console.log(themes)
  const theme = themes.doelger
  theme.plugins = [new CodePlugin()]
  const typography = new Typography(theme)
  setHeadComponents([
    <TypographyStyle typography={typography} />,
    <GoogleFont typography={typography} />,
  ])
}
