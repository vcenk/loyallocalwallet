import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import {
  PageHeader,
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@llw/ui";
import { EDITABLE_PROGRAM_STATUSES, REWARD_MODELS, rewardModel } from "@llw/config";
import { createClient } from "@/lib/supabase/server";
import {
  WalletCardPreview,
  STAMP_ICON_KEYS,
  PATTERN_KEYS,
  CARD_STYLE_KEYS,
  STAMP_STYLE_KEYS,
} from "@/components/wallet-card-preview";
import { updateProgram, updateDesign } from "../actions";

const SELECT_CLASS =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default async function EditProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  const { programId } = await params;
  const { error, saved, created } = await searchParams;

  const supabase = await createClient();
  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("*")
    .eq("id", programId)
    .maybeSingle();
  if (!program) notFound();

  const [{ data: design }, { data: business }] = await Promise.all([
    supabase
      .from("card_designs")
      .select("*")
      .eq("program_id", programId)
      .maybeSingle(),
    supabase
      .from("businesses")
      .select("name, logo_url")
      .eq("id", program.business_id)
      .maybeSingle(),
  ]);

  const bg = design?.background_color ?? "#ae3115";
  const fg = design?.foreground_color ?? "#ffffff";
  const stampIcon = design?.stamp_icon ?? "star";
  const cardPattern = design?.pattern ?? "none";
  const cardStyle = design?.card_style ?? "retail";
  const stampStyle = design?.stamp_style ?? "circles";
  const stampsRequired = program.stamps_required ?? 10;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const joinUrl = `${appUrl}/join/${program.id}`;
  const qrDataUrl = await QRCode.toDataURL(joinUrl, {
    width: 220,
    margin: 1,
    color: { dark: "#261815", light: "#ffffff" },
  });

  return (
    <div>
      <PageHeader
        title={program.name}
        description="Edit your stamp card and design."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/loyalty-cards">Back to cards</Link>
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {saved || created ? (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {created ? "Card created." : "Changes saved."}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Card details</CardTitle>
              <CardDescription>Name, stamps, reward, and status.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateProgram} className="space-y-4">
                <input type="hidden" name="programId" value={program.id} />

                <div className="space-y-1.5">
                  <Label htmlFor="name">Card name</Label>
                  <Input id="name" name="name" defaultValue={program.name} required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">
                    Description{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={program.description ?? ""}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rewardModel">Reward model</Label>
                  <select
                    id="rewardModel"
                    name="rewardModel"
                    defaultValue={program.program_type}
                    className={SELECT_CLASS}
                  >
                    {REWARD_MODELS.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="stampsRequired">
                      {rewardModel(program.program_type).targetLabel}
                    </Label>
                    <Input
                      id="stampsRequired"
                      name="stampsRequired"
                      type="number"
                      min={1}
                      max={100000}
                      defaultValue={stampsRequired}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={program.status}
                      className={SELECT_CLASS}
                    >
                      {EDITABLE_PROGRAM_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rewardTitle">Reward</Label>
                  <Input
                    id="rewardTitle"
                    name="rewardTitle"
                    defaultValue={program.reward_title}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rewardDescription">
                    Reward details{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="rewardDescription"
                    name="rewardDescription"
                    defaultValue={program.reward_description ?? ""}
                  />
                </div>

                <Button type="submit">Save changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design</CardTitle>
              <CardDescription>
                Colors for the wallet card. Save to update the preview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateDesign} className="space-y-4">
                <input type="hidden" name="programId" value={program.id} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="backgroundColor">Background</Label>
                    <input
                      id="backgroundColor"
                      name="backgroundColor"
                      type="color"
                      defaultValue={bg}
                      className="h-10 w-full rounded-lg border border-input bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="foregroundColor">Text</Label>
                    <input
                      id="foregroundColor"
                      name="foregroundColor"
                      type="color"
                      defaultValue={fg}
                      className="h-10 w-full rounded-lg border border-input bg-card"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stampIcon">Stamp icon</Label>
                  <select
                    id="stampIcon"
                    name="stampIcon"
                    defaultValue={stampIcon}
                    className={SELECT_CLASS}
                  >
                    {STAMP_ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pattern">Background pattern</Label>
                  <select
                    id="pattern"
                    name="pattern"
                    defaultValue={cardPattern}
                    className={SELECT_CLASS}
                  >
                    {PATTERN_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cardStyle">Card style</Label>
                    <select id="cardStyle" name="cardStyle" defaultValue={cardStyle} className={SELECT_CLASS}>
                      {CARD_STYLE_KEYS.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="stampStyle">Stamp style</Label>
                    <select id="stampStyle" name="stampStyle" defaultValue={stampStyle} className={SELECT_CLASS}>
                      {STAMP_STYLE_KEYS.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button type="submit" variant="outline">
                  Save design
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Preview
            </p>
            <WalletCardPreview
              businessName={business?.name ?? ""}
              programName={program.name}
              rewardTitle={program.reward_title}
              stampsRequired={stampsRequired}
              currentStamps={Math.min(1, stampsRequired)}
              backgroundColor={bg}
              foregroundColor={fg}
              stampIcon={stampIcon}
              pattern={cardPattern}
              cardStyle={cardStyle}
              stampStyle={stampStyle}
              programType={program.program_type}
              logoUrl={business?.logo_url}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enrollment QR</CardTitle>
              <CardDescription>
                {program.status === "active"
                  ? "Print this and place it at your counter."
                  : "Set status to active to let customers enroll."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Enrollment QR code"
                width={180}
                height={180}
                className="rounded-lg"
              />
              <a
                href={joinUrl}
                target="_blank"
                rel="noreferrer"
                className="break-all text-center text-xs text-primary hover:underline"
              >
                {joinUrl}
              </a>
              <a
                href={qrDataUrl}
                download={`enroll-${program.id}.png`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Download PNG
              </a>
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link href={`/dashboard/loyalty-cards/${program.id}/poster`}>
                  Print counter poster
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
