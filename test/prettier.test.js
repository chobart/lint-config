// Ustawienia Prettiera: cudzysłowy, przecinki, kolejność importów i klas Tailwinda.
import assert from "node:assert/strict";
import { test } from "node:test";
import * as prettier from "prettier";

import config from "../prettier.config.js";

const input = `import { helper } from './local'
import { parent } from '../parent'
import React from 'react'
import { z } from 'zod'
export const View = () => <div className='text-white p-4 flex' title='x'>{[helper, parent, React, z].length}</div>
`;

const expected = `import React from "react";

import { z } from "zod";

import { parent } from "../parent";
import { helper } from "./local";

export const View = () => (
  <div className="flex p-4 text-white" title="x">
    {[helper, parent, React, z].length}
  </div>
);
`;

test("format według wspólnej konfiguracji", async () => {
  const output = await prettier.format(input, { ...config, filepath: "view.tsx" });
  assert.equal(output, expected);
});
