import { CocktailRecipe, Role } from '@prisma/client';
import Link from 'next/link';
import { ManageEntityLayout } from '../../../../../components/layout/ManageEntityLayout';
import { ManageColumn } from '../../../../../components/ManageColumn';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Loading } from '../../../../../components/Loading';
import { useRouter } from 'next/router';
import { alertService } from '../../../../../lib/alertService';
import { UserContext } from '../../../../../lib/context/UserContextProvider';
import AvatarImage from '../../../../../components/AvatarImage';
import { FaPlus } from 'react-icons/fa';
import ListSearchField from '../../../../../components/ListSearchField';

export default function CocktailsOverviewPage() {
  const router = useRouter();
  const { workspaceId } = router.query;

  const userContext = useContext(UserContext);

  const [cocktailRecipes, setCocktailRecipes] = useState<CocktailRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterString, setFilterString] = useState('');

  const refreshCocktails = useCallback(() => {
    if (!workspaceId) return;
    fetch(`/api/workspaces/${workspaceId}/cocktails`)
      .then(async (response) => {
        const body = await response.json();
        if (response.ok) {
          setCocktailRecipes(body.data);
        } else {
          console.log('Cocktails -> fetchRecipes', response, body);
          alertService.error(body.message, response.status, response.statusText);
        }
      })
      .catch((err) => alertService.error(err.message))
      .finally(() => {
        setLoading(false);
      });
  }, [workspaceId]);

  useEffect(() => {
    refreshCocktails();
  }, [refreshCocktails]);

  return (
    <ManageEntityLayout
      backLink={`/workspaces/${workspaceId}/manage`}
      title={'Cocktails'}
      actions={
        userContext.isUserPermitted(Role.MANAGER) ? (
          <Link href={`/workspaces/${workspaceId}/manage/cocktails/create`}>
            <div className={'btn btn-square btn-primary btn-sm md:btn-md'}>
              <FaPlus />
            </div>
          </Link>
        ) : undefined
      }
    >
      <div className={'card'}>
        <div className={'card-body'}>
          <ListSearchField onFilterChange={(filterString) => setFilterString(filterString)} />
          <div className="overflow-x-auto">
            <table className="table-compact table table-zebra w-full">
              <thead>
                <tr>
                  <th className=""></th>
                  <th className="">Name</th>
                  <th className="">Preis</th>
                  <th className="">Tags</th>
                  <th className="flex justify-end"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className={'w-full'}>
                    <td colSpan={5}>
                      <Loading />
                    </td>
                  </tr>
                ) : cocktailRecipes.filter(
                    (cocktailRecipe) =>
                      cocktailRecipe.name.toLowerCase().includes(filterString.toLowerCase()) ||
                      cocktailRecipe.tags.some((tag) => tag.toLowerCase().includes(filterString.toLowerCase())),
                  ).length == 0 ? (
                  <tr>
                    <td colSpan={5} className={'text-center'}>
                      Keine Einträge gefunden
                    </td>
                  </tr>
                ) : (
                  cocktailRecipes
                    .filter(
                      (cocktailRecipe) =>
                        cocktailRecipe.name.toLowerCase().includes(filterString.toLowerCase()) ||
                        cocktailRecipe.tags.some((tag) => tag.toLowerCase().includes(filterString.toLowerCase())),
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((cocktailRecipe) => (
                      <tr key={cocktailRecipe.id} className={''}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12">
                              <AvatarImage
                                src={`/api/workspaces/${cocktailRecipe.workspaceId}/cocktails/${cocktailRecipe.id}/image`}
                                alt={'Cocktail'}
                                altComponent={<></>}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{cocktailRecipe.name}</td>
                        <td className={''}>
                          <span className={'whitespace-nowrap'}>{cocktailRecipe.price} €</span>
                        </td>
                        <td className={'flex items-center gap-1'}>
                          {cocktailRecipe.tags.map((tag) => (
                            <div key={`cocktail-${cocktailRecipe.id}-tags-${tag}`} className={'badge badge-primary'}>
                              {tag}
                            </div>
                          ))}
                        </td>
                        <ManageColumn entity={'cocktails'} id={cocktailRecipe.id} onRefresh={refreshCocktails} />
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ManageEntityLayout>
  );
}
