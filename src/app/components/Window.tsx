import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

type WindowProps = {
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  showTextWindow?: boolean;
  children: React.ReactNode;
};

type TextWindowPayload = {
  text: string;
  images: string[];
  windowName: string;
  subheading1: string;
  subheading2: string;
  numberOfSightings: number;
};

const TEXT_WINDOW_DEFAULTS: Record<string, TextWindowPayload> = {
  "/circle-push": {
    text: "I see these rabbits littered across the various spots of greenery that litter Boston. They tend to hide away in shrubbery in the day. I've seen them most often during the night, where they graze out in the open.\n\nFound mainly in Northern and Central America\nEat a wide variety of plants ranging from 70 - 145 documented plant species ",
    images: [],
    windowName: "Eastern Cottontail: Information",
    subheading1: "Eastern Cottontail",
    subheading2: "Sylvilagus floridanus",
    numberOfSightings: 8,
  },
  "/water-physics": {
    text: "When I saw a Malllard I thought, \"Wow, that's a classic duck, it can't look anymore like a duck with it's green head and yellow bill\" \nI saw this Mallard at Back Bay Fens.\n\nThe mallard inhabits a wide range of habitats and climates, from the Arctic tundra to subtropical regions.  It is found in both fresh- and salt-water wetlands, including parks, small ponds, rivers, lakes and estuaries, as well as shallow inlets and open sea within sight of the coastline\n\nThe majority of the mallard's diet seems to be made up of gastropods, insects (including beetles, flies, lepidopterans, dragonflies, and caddisflies), crustaceans, other arthropods, worms, feces of other birds, many varieties of seeds and plant matter, and roots and tubers.",
    images: [],
    windowName: "Mallard: Information",
    subheading1: "Mallard",
    subheading2: "Anas platyrhynchos\n",
    numberOfSightings: 5,
  },
  "/honey-locust": {
    text: "I chose to take a walk at the Charles River Esplanade for the first time where I saw the Honey Locust for the first time. I originally thought that the thorns were a potentially symbiotic vine that defends that tree, however, I learnt that the thorns are part of the tree. I also learnt that the pods it houses a sweet pulp when they mature, hence the \"Honey\" in its name.\n\nThe native range of the honey locust is widely agreed to be from northern Mexico through the Gulf Coast of the United States, northwards into the Midwest, parts of the US East Coast, and the southernmost parts of Canada.\n\nHoney locusts commonly have thorns 6–10 cm (2+1⁄2–4 in) long growing out of the branches and trunk, some reaching lengths of 20 cm (8 in) these may be single, or branched into several points, and commonly form dense clusters.",
    images: [],
    windowName: "Honey Locust: Information",
    subheading1: "Honey Locust",
    subheading2: " Gleditsia triacanthos\n",
    numberOfSightings: 12,
  },
  "/willow-tree": {
    text: "On my walk through the Charles River Esplanade, all the Weeping Willow trees were yellow and lacked leaves due to winter time. I wondered what they looked like alive and found this image. I imagined the vines like strands of hair, blowing around.\n\nThis tree is a species of willow native to dry areas of northern China, Korea, Mongolia, Japan, and Siberia.\n\nSalix babylonica is a medium- to large-sized deciduous tree, growing up to 20–25 m (66–82 ft) tall. It grows rapidly, but has a short lifespan, between 40 and 75 years.",
    images: [],
    windowName: "Weeping Willow Tree: Information",
    subheading1: "Weeping Willow \n",
    subheading2: "Salix babylonica\n",
    numberOfSightings: 9,
  },
  "/joint-tooth-moss": {
    text: "I see these mosses quite often, in round circular clumps across green patches of Earth that litter Boston. I noticed that I do not see them when there is a lot of mulch on the ground. I wonder why.\n\nJoint-toothed mosses make up the largest class of mosses, comprising about 95% of all species (roughly 11,500). They are characterized by specialized \"arthrodontous\" teeth on their spore capsules that are jointed and separate from one another. They are common globally in diverse damp, wooded habitats. \n\n",
    images: [],
    windowName: "Joint Tooth Moss: Information",
    subheading1: "Joint Tooth Mosses",
    subheading2: "Bryopsida",
    numberOfSightings: 38,
  },
  "/wild-turkey": {
    text: "I don't have a phobia of birds, however a Turkey charging me and slinging it's head around is terrifying.\n\nIn the Northeast of North America, turkeys are most profuse in hardwood timber of oak-hickory (Quercus-Carya) and forests of red oak (Quercus rubra), beech (Fagus grandifolia), cherry (Prunus serotina) and white ash (Fraxinus americana).\n\nWild turkeys prefer eating acorns, nuts, and other hard mast of various trees, including hazel, chestnut, hickory, and pinyon pine, as well as various seeds, berries such as juniper and bearberry, buds, leaves, fern fronds, roots, and insects and also occasionally consume amphibians such as salamanders and small reptiles such as lizards and small snakes.",
    images: [],
    windowName: "Wild Turkey: Information",
    subheading1: "Wild Turkey",
    subheading2: "Meleagris gallopavo",
    numberOfSightings: 15,
  },
};

const ROUTER_BASENAME = "/DESIGNSTRATEGYWEBSITE";

const PAGE_PATH_ALIASES: Record<string, string> = {
  "/wildturkey": "/wild-turkey",
  "/turkey": "/wild-turkey",
  "/willow": "/willow-tree",
  "/willowtree": "/willow-tree",
};

const normalizePagePath = (rawPath: string) => {
  const trimmed = rawPath.trim().toLowerCase();
  const withoutTrailingSlash = trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
  return withoutTrailingSlash || "/";
};

const toCanonicalPagePath = (rawPath: string) => {
  const normalizedPath = normalizePagePath(rawPath);
  const normalizedBase = normalizePagePath(ROUTER_BASENAME);
  const withoutBase =
    normalizedPath === normalizedBase
      ? "/"
      : normalizedPath.startsWith(`${normalizedBase}/`)
        ? normalizedPath.slice(normalizedBase.length)
        : normalizedPath;
  const path = withoutBase || "/";
  return PAGE_PATH_ALIASES[path] ?? path;
};

export default function Window({
  title = "",
  width,
  height,
  className = "",
  contentClassName = "",
  contentStyle,
  showTextWindow = true,
  children,
}: WindowProps) {
  const location = useLocation();
  const clampSightings = (value: number) => Math.max(0, Math.min(99, value));
  const pagePath = useMemo(() => toCanonicalPagePath(location.pathname || "/"), [location.pathname]);
  const defaultWindowName = title ? `${title}: Information` : "Information";
  const pageDefaults = useMemo(
    () =>
      TEXT_WINDOW_DEFAULTS[pagePath] ?? {
        text: "",
        images: [],
        windowName: defaultWindowName,
        subheading1: "",
        subheading2: "Add notes and images",
        numberOfSightings: 1,
      },
    [defaultWindowName, pagePath],
  );
  const [currentDefaults, setCurrentDefaults] = useState<TextWindowPayload>(pageDefaults);

  const [noteText, setNoteText] = useState(pageDefaults.text);
  const [imageInput, setImageInput] = useState("");
  const [images, setImages] = useState<string[]>(pageDefaults.images);
  const [windowName, setWindowName] = useState(pageDefaults.windowName);
  const [subheading1, setSubheading1] = useState(pageDefaults.subheading1);
  const [subheading2, setSubheading2] = useState(pageDefaults.subheading2);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const [jsonStatus, setJsonStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [sightingsValue, setSightingsValue] = useState(clampSightings(pageDefaults.numberOfSightings));
  const [sightingsInput, setSightingsInput] = useState(String(clampSightings(pageDefaults.numberOfSightings)));
  const visibleNotes = noteText.trim() !== "" ? noteText : currentDefaults.text;
  const normalizeSubheading = (value: string) => value.replace(/^<i>/i, "").replace(/<\/i>$/i, "");
  const displaySubheading1 = normalizeSubheading(subheading1);
  const displaySubheading2 = normalizeSubheading(subheading2);

  useEffect(() => {
    setCurrentDefaults(pageDefaults);
    setNoteText(pageDefaults.text);
    setImages([...pageDefaults.images]);
    setWindowName(pageDefaults.windowName);
    setSubheading1(pageDefaults.subheading1);
    setSubheading2(pageDefaults.subheading2);
    const clampedSightings = clampSightings(pageDefaults.numberOfSightings);
    setSightingsValue(clampedSightings);
    setSightingsInput(String(clampedSightings));
    setSaveStatus("idle");
    setJsonStatus("idle");
  }, [pageDefaults]);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timeoutId = window.setTimeout(() => {
      setSaveStatus("idle");
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [saveStatus]);

  useEffect(() => {
    if (jsonStatus === "idle") return;
    const timeoutId = window.setTimeout(() => {
      setJsonStatus("idle");
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, [jsonStatus]);

  const windowStyle: React.CSSProperties = {
    ...(width !== undefined ? { width: typeof width === "number" ? `${width}px` : width } : null),
    ...(height !== undefined ? { height: typeof height === "number" ? `${height}px` : height } : null),
  };

  const addImage = () => {
    const next = imageInput.trim();
    if (!next) return;
    setImages((prev) => [...prev, next]);
    setImageInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const saveEdits = () => {
    if (!showTextWindow || typeof window === "undefined") return;
    const payload: TextWindowPayload = {
      text: noteText,
      images,
      windowName,
      subheading1,
      subheading2,
      numberOfSightings: clampSightings(sightingsValue),
    };
    setCurrentDefaults(payload);
    setSightingsValue(payload.numberOfSightings);
    setSightingsInput(String(payload.numberOfSightings));
    setSaveStatus("saved");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(JSON.stringify(payload, null, 2))
        .then(() => setJsonStatus("copied"))
        .catch(() => setJsonStatus("failed"));
    } else {
      setJsonStatus("failed");
    }
  };

  const handleNotesBlur = () => {
    if (noteText.trim() !== "") return;
    setNoteText(currentDefaults.text);
  };

  const stepSightings = (delta: number) => {
    setSightingsValue((prev) => {
      const next = clampSightings(prev + delta);
      setSightingsInput(String(next));
      return next;
    });
  };

  const handleSightingsInputChange = (value: string) => {
    const nextRaw = value.replace(/\D+/g, "").slice(0, 2);
    setSightingsInput(nextRaw);
    const parsed = nextRaw === "" ? 0 : Number.parseInt(nextRaw, 10);
    setSightingsValue(clampSightings(parsed));
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-3 w-full">
      <div className={`win95-window ${className}`.trim()} style={windowStyle}>
        <div className="win95-titlebar">
          <div className="win95-titlebar-text">{title}</div>
          <div className="win95-titlebar-controls">
            <span className="win95-control-button" />
            <span className="win95-control-button" />
            <span className="win95-control-button" />
          </div>
        </div>
        <div className={`win95-window-content ${contentClassName}`.trim()} style={contentStyle}>
          {children}
        </div>
      </div>

      {showTextWindow && (
        <div className="win95-window w-full lg:w-[320px]">
          <div className="win95-titlebar">
            <div className="win95-titlebar-text">{windowName || "Text Window"}</div>
            <div className="win95-titlebar-controls">
              <span className="win95-control-button" />
              <span className="win95-control-button" />
              <span className="win95-control-button" />
            </div>
          </div>
          <div className="win95-window-content flex flex-col gap-2 text-[13px] leading-[1.4]">
            <label className="text-[13px] debug-only">Window Name</label>
            <input
              className="win95-input w-full debug-only text-[13px]"
              type="text"
              value={windowName}
              onChange={(e) => setWindowName(e.target.value)}
            />

            <label className="text-[13px] debug-only">Subheading 1</label>
            <textarea
              className="win95-input w-full debug-only text-[13px]"
              rows={2}
              value={subheading1}
              onChange={(e) => setSubheading1(e.target.value)}
            />

            <label className="text-[13px] debug-only">Subheading 2</label>
            <textarea
              className="win95-input w-full debug-only text-[13px]"
              rows={2}
              value={subheading2}
              onChange={(e) => setSubheading2(e.target.value)}
            />

            {displaySubheading1 && <p className="whitespace-pre-line text-[17px] leading-tight">{displaySubheading1}</p>}
            {displaySubheading2 && <p className="italic whitespace-pre-line text-[13px] leading-tight">{displaySubheading2}</p>}

            <div className="flex items-center gap-2 debug-only">
              <button type="button" className="win95-button" onClick={saveEdits}>Save Edits</button>
              {saveStatus === "saved" && <span className="text-[13px]">Saved</span>}
              {jsonStatus === "copied" && <span className="text-[13px]">JSON copied</span>}
              {jsonStatus === "failed" && <span className="text-[13px]">JSON copy failed</span>}
            </div>

            <label className="text-[13px]">Notes</label>
            <div className="win95-border-sunken bg-white px-2 py-2 min-h-[96px] whitespace-pre-line debug-hide">
              {visibleNotes || "No notes added"}
            </div>
            <textarea
              className="win95-input w-full debug-only text-[13px]"
              rows={6}
              placeholder="Add text here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleNotesBlur}
            />

            <label className="text-[13px] debug-only">Image URL</label>
            <div className="flex gap-2 debug-only">
              <input
                className="win95-input flex-1 text-[13px]"
                type="text"
                placeholder="https://..."
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
              />
              <button type="button" className="win95-button" onClick={addImage}>Add</button>
            </div>

            <div
              className="win95-window w-full mt-1"
              style={{
                width: "100%",
                maxWidth: "220px",
                aspectRatio: "1 / 1",
                alignSelf: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="win95-titlebar">
                <div className="win95-titlebar-text">Number of Sightings in my Week</div>
              </div>
              <div className="win95-window-content flex flex-col flex-1 overflow-hidden">
                <div
                  className="flex-1 min-h-0 flex items-center justify-center overflow-hidden text-center"
                  style={{
                    fontFamily: 'Aharoni, "Arial Black", "Microsoft Sans Serif", sans-serif',
                    fontSize: sightingsValue > 9 ? "clamp(36px, 8vw, 86px)" : "clamp(48px, 10vw, 112px)",
                    lineHeight: 0.9,
                  }}
                >
                  <div className="win95-border-sunken bg-white w-[76%] aspect-square max-w-full max-h-full flex items-center justify-center px-2">
                    {sightingsValue}
                  </div>
                </div>

                <div className="debug-only">
                  <div className="flex items-center gap-1 mt-1">
                    <button type="button" className="win95-button" onClick={() => stepSightings(-1)}>-</button>
                    <input
                      className="win95-input w-full text-center text-[13px]"
                      type="text"
                      inputMode="numeric"
                      value={sightingsInput}
                      onChange={(e) => handleSightingsInputChange(e.target.value)}
                    />
                    <button type="button" className="win95-button" onClick={() => stepSightings(1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex flex-col gap-2 max-h-64 overflow-auto">
                {images.map((src, index) => (
                  <div key={`${src}-${index}`} className="win95-border-sunken p-1 bg-white">
                    <img src={src} alt={`User content ${index + 1}`} className="w-full h-auto" draggable={false} />
                    <div className="mt-1 flex justify-end">
                      <button type="button" className="win95-button" onClick={() => removeImage(index)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
