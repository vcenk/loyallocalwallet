import Link from "next/link";
import {
  PageHeader,
  Button,
  Input,
  Label,
  Card,
  CardContent,
} from "@llw/ui";
import { DEFAULT_STAMPS_REQUIRED } from "@llw/config";
import { createProgram } from "../actions";

export default async function NewProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New loyalty card"
        description="Create a stamp card. You can edit the design and publish it next."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/loyalty-cards">Cancel</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 pt-6">
          {error ? (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form action={createProgram} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Card name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Coffee Rewards"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="Earn a free coffee after 10 visits."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="stampsRequired">Stamps required</Label>
              <Input
                id="stampsRequired"
                name="stampsRequired"
                type="number"
                min={1}
                max={50}
                defaultValue={DEFAULT_STAMPS_REQUIRED}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rewardTitle">Reward</Label>
              <Input
                id="rewardTitle"
                name="rewardTitle"
                required
                placeholder="Free coffee"
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
                placeholder="One regular coffee, any size."
              />
            </div>

            <Button type="submit" className="w-full">
              Create card
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
