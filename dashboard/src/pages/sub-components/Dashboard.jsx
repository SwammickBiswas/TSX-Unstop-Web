import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent } from "../../components/ui/tabs";

import SpecialLoadingButton from "./SpecialLoadingButton";

import { clearAllSkillErrors } from "../../store/slices/skillSlice";
import {
  clearAllSoftwareAppErrors,
  deleteSoftwareApplication,
  getAllSoftwareApplications,
  resetSoftwareApplicationSlice,
} from "../../store/slices/softwareApplicationSlice";
import { clearAllTimelineErrors } from "../../store/slices/timelineSlice";
import { clearAllProjectErrors } from "../../store/slices/projectSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [appId, setAppId] = useState(null);

  const { user } = useSelector((state) => state.user);
  const { skills, error: skillError } = useSelector((state) => state.skill);
  const {
    softwareApplications,
    loading: appLoading,
    error: appError,
    message: appMessage,
  } = useSelector((state) => state.application);
  const { projects, error: projectError } = useSelector((state) => state.project);
  const { timeline, error: timelineError } = useSelector((state) => state.timeline);

  const handleDeleteSoftwareApp = (id) => {
    setAppId(id);
    dispatch(deleteSoftwareApplication(id));
  };

  useEffect(() => {
    if (skillError) {
      toast.error(skillError);
      dispatch(clearAllSkillErrors());
    }
    if (appError) {
      toast.error(appError);
      dispatch(clearAllSoftwareAppErrors());
    }
    if (projectError) {
      toast.error(projectError);
      dispatch(clearAllProjectErrors());
    }
    if (appMessage) {
      toast.success(appMessage);
      setAppId(null);
      dispatch(resetSoftwareApplicationSlice());
      dispatch(getAllSoftwareApplications());
    }
    if (timelineError) {
      toast.error(timelineError);
      dispatch(clearAllTimelineErrors());
    }
  }, [dispatch, skillError, appError, appMessage, projectError, timelineError]);

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="sm:col-span-2">
              <CardHeader className="pb-3">
                <CardDescription className="max-w-lg leading-relaxed">
                  {user.aboutMe}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button>Visit Portfolio</Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle>Projects Completed</CardTitle>
                <CardTitle className="text-6xl">{projects?.length}</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate("/manage/projects")}>Manage Projects</Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle>Skills</CardTitle>
                <CardTitle className="text-6xl">{skills?.length}</CardTitle>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate("/manage/skills")}>Manage Skills</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Projects Tab */}
          <Tabs defaultValue="projects">
            <TabsContent value="projects">
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Stack</TableHead>
                        <TableHead className="hidden md:table-cell">Deployed</TableHead>
                        <TableHead>Update</TableHead>
                        <TableHead className="text-right">Visit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects?.length > 0 ? (
                        projects.map((proj) => (
                          <TableRow key={proj._id} className="bg-accent">
                            <TableCell className="font-medium">{proj.title}</TableCell>
                            <TableCell className="hidden md:table-cell">{proj.stack}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge variant="secondary">{proj.deployed}</Badge>
                            </TableCell>
                            <TableCell>
                              <Link to={`/update/project/${proj._id}`}>
                                <Button>Update</Button>
                              </Link>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link to={proj.projectLink} target="_blank">
                                <Button>Visit</Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5}>You have not added any project.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Skills Tab */}
          <Tabs defaultValue="skills">
            <TabsContent value="skills">
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  {skills?.length > 0 ? (
                    skills.map((skill) => (
                      <Card key={skill._id}>
                        <CardHeader>{skill.title}</CardHeader>
                        <CardFooter>
                          <Progress value={skill.proficiency} />
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p className="text-3xl">You have not added any skill.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Applications and Timeline Tab */}
          <Tabs defaultValue="timeline">
            <TabsContent value="timeline" className="grid min-[1050px]:grid-cols-2 gap-4">
              {/* Applications */}
              <Card>
                <CardHeader className="px-7">
                  <CardTitle>Software Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="md:table-cell">Icon</TableHead>
                        <TableHead className="md:table-cell text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {softwareApplications?.length > 0 ? (
                        softwareApplications.map((app) => (
                          <TableRow key={app._id} className="bg-accent">
                            <TableCell className="font-medium">{app.name}</TableCell>
                            <TableCell className="md:table-cell">
                              <img className="w-7 h-7" src={app.svg?.url} alt={app.name} />
                            </TableCell>
                            <TableCell className="md:table-cell text-center">
                              {appLoading && appId === app._id ? (
                                <SpecialLoadingButton content="Deleting" width="w-fit" />
                              ) : (
                                <Button onClick={() => handleDeleteSoftwareApp(app._id)}>Delete</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3}>You have not added any application.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader className="px-7 flex items-center justify-between">
                  <CardTitle>Timeline</CardTitle>
                  <Button onClick={() => navigate("/manage/timeline")} className="w-fit">
                    Manage Timeline
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="md:table-cell">From</TableHead>
                        <TableHead className="md:table-cell text-right">To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeline?.length > 0 ? (
                        timeline.map((t) => (
                          <TableRow key={t._id} className="bg-accent">
                            <TableCell className="font-medium">{t.title}</TableCell>
                            <TableCell className="md:table-cell">{t.timeline.from}</TableCell>
                            <TableCell className="md:table-cell text-right">{t.timeline.to}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3}>You have not added any timeline.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;