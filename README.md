# alexandrix-website
Website for alexandrix.com, initially icosacid.com

# Setup
* Install npm (https://www.npmjs.com/get-npm)
* Open your favourite Command Line Interface. *git bash*, the CLI that comes with Git (https://git-scm.com/downloads), is an option I would recommend
* Optional: you may want to switch to the *dev* branch to get the latest commits, in the CLI run **git checkout dev**
* Run **npm install** to import all necessary packages
* Run **npm start** to boot a local server on port 8080
* Open your favorite browser and navigate to **127.0.0.1:8080** or **localhost:8080**
* Enjoy

# Translations
The site is available in English (source, at the root: **/about**) and French (**/fr/about**). The language is picked from the URL, then from the choice made with the EN/FR switcher in the menu (remembered in the browser), then from the browser languages (first supported one wins). Visitors landing on an unprefixed URL with a French browser are redirected to **/fr/...**.
* English lives in **index.html**. Every translatable text carries a **data-i18n="key"** attribute (HTML allowed in the translation) and attributes such as alt/title carry **data-i18n-attr="alt:key;title:key"**. Markup is never duplicated: a translation only holds the text and the inline tags (**&lt;a&gt;**, **&lt;em&gt;**, **&lt;br&gt;**, icons...) which are matched to the original ones (keep their order, or their **n="index"** attribute when several of the same kind are in a sentence)
* French translations are in **locales/fr.json**. **locales/en.json** is generated and only there to help translating: do not edit it
* Texts built in JS use **I18n.t('key', 'English text', { values })**, the same key goes in **locales/fr.json**
* Elements filled by JS or not translatable can be excluded with a **data-i18n-skip** attribute
* After adding or changing English text, run **npm run i18n:tag** (tags new texts, adds their keys with an empty French value, refreshes en.json) then translate the new keys in **locales/fr.json**. An empty or missing translation falls back to English
* **npm run i18n:check** lists untagged texts, untranslated keys and unused keys (**-- --strict** makes untranslated keys an error)

# Compiling LESS into CSS with Visual Studio Code
* Install the Easy LESS extension (by mrcrowl)
* All .less files are automatically compiled to CSS on file save

# Compiling LESS into CSS without Visual Studio Code
* Install the LESS preprocessor (http://lesscss.org/usage/)
* Run **lessc less/main.less css/main.css**
* Now your can see your updated CSS
