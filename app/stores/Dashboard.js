import { toast } from 'vue-sonner';
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', () => {
    const config = useRuntimeConfig();
    const token = useCookie('access_token');
    const dashboardData = ref(null);

    async function fetchData() {
        try {
            const [data, projectResponse, engineersResponse, standupResponse] = await Promise.all([
                $fetch(config.public.apiBase + '/project/dashboard', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                }),
                $fetch(config.public.apiBase + '/project/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                }),
                $fetch(config.public.apiBase + '/project/engineer/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                }),
                $fetch(config.public.apiBase + '/project/standup', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                })
            ]);

            const projects = projectResponse.results;
            const filteredProjects = projects.filter(project => project.status !== 'Complete');
            const standup = standupResponse.results;

            const getTodayOrLatest = (data) => {
                const today = new Date().toISOString().split('T')[0];

                var todayData = data.filter(daily => daily.date === today);

                if (todayData.length > 0) {
                    return todayData;
                }

                var latestDate = null;
                data.forEach(daily => {
                    if (!latestDate || new Date(daily.date) > new Date(latestDate)) {
                        latestDate = daily.date;
                    }
                });

                var latestData = data.filter(daily => daily.date === latestDate);
                return latestData;
            };

            const filteredStandup = getTodayOrLatest(standup);

            // Fallback total_user
            let totalUser = data?.total_user;
            if (totalUser == null) {
                try {
                    const usersCountResp = await $fetch(config.public.apiBase + '/userprofile/?page_size=1', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token.value}`
                        }
                    });
                    if (typeof usersCountResp?.count === 'number') {
                        totalUser = usersCountResp.count;
                    }
                } catch (err) {
                    // silent fallback; toast not needed for optional enhancement
                }
            }

            dashboardData.value = {
                ...data,
                total_user: totalUser,
                projects: filteredProjects,
                engineers: engineersResponse,
                standup: filteredStandup
            };
            return true;
        } catch (error) {
            toast.error("Failed to fetch dashboard data. Please try again later.");
            return false;
        }
    }

    return {
        fetchData,
        dashboardData
    }
});
