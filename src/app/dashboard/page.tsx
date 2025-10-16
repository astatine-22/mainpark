import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import StatsCards from '@/components/dashboard/stats-cards';
import OccupancyChart from '@/components/dashboard/occupancy-chart';
import RecentBookings from '@/components/dashboard/recent-bookings';
import OccupancyPredictor from '@/components/dashboard/occupancy-predictor';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          Manager Dashboard
        </h2>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="predictor">AI Predictor</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <StatsCards />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    A list of the most recent bookings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentBookings />
                </CardContent>
              </Card>
              <Card className="col-span-4 md:col-span-3">
                 <CardHeader>
                  <CardTitle>AI Occupancy Predictor</CardTitle>
                  <CardDescription>
                    Predict future occupancy rates using AI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OccupancyPredictor />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Analytics</CardTitle>
                <CardDescription>
                  View occupancy trends over time to optimize your operations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <OccupancyChart />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="predictor" className="space-y-4">
            <Card>
              <CardHeader>
                  <CardTitle>AI Occupancy Predictor</CardTitle>
                  <CardDescription>
                    Leverage AI to predict parking occupancy trends and inform users of likely availability, helping them plan their trips better.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OccupancyPredictor />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
