export default defineEventHandler(async () => {
  const config = useRuntimeConfig();

  const data: any = await $fetch(
    `https://api.torn.com/v2/faction/21665/hof?key=${config.tornApiKey}`,
  );

  return {
    rankTier: data.hof.rank.value,
    rankPosition: data.hof.rank.rank,

    totalRespect: data.hof.respect.value,
    respectRank: data.hof.respect.rank,

    bestChain: data.hof.chain.value,
    chainRank: data.hof.chain.rank,
  };
});
