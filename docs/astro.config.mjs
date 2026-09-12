import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  site: "https://docs.musikbot.app/",
  base: "/lastfm-client",
  integrations: [
    starlight({
      title: "LastFm Client",
      logo: {
        src: "./src/assets/musikbot-logo.svg",
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/musikbotapp/lastfm-client" },
        { icon: "npm", label: "npm", href: "https://www.npmjs.com/package/@musikbotapp/lastfm-client" },
        { icon: "link", label: "Website", href: "https://musikbot.app/" },
      ],
      expressiveCode: {
        themes: ["github-dark"],
        styleOverrides: {
          borderRadius: "0.6rem",
          borderWidth: "1px",
          borderColor: "#2b2d31",
          codeBackground: "#111214",
          frameBoxShadowCssValue: "none",

          headerBackground: "#1e1f22",
          headerBorderColor: "#2b2d31",
          headerPadding: "0.5rem 1rem",

          tabBackground: "transparent",
          tabActiveBackground: "#111214",
          tabBorderRadius: "0.4rem 0.4rem 0 0",
          tabActiveBorderColor: "#57f287",

          codeFontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
          codeFontSize: "0.875rem",
        },
      },
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightTypeDoc({
          entryPoints: ["../src/documentation-index.ts"],
          tsconfig: "../tsconfig.json",
          typeDoc: {
            useCodeBlocks: true,
            propertiesFormat: "list",
            enumMembersFormat: "table",
            typeDeclarationFormat: "list",
            indexFormat: "table",
            expandParameters: true,
            expandObjects: true,
          },
          pagination: true,
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [{ label: "Quickstart", link: "/getting-started/quickstart" }],
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
