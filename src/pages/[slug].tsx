import type { NextPage } from 'next';
import { v4 as uuid } from 'uuid';
import { formatValue } from 'utils/formatValue';
import { useShoppingCart } from 'hooks/useShoppingCart';
import { ProductType } from 'types/ProductType';
import { addApolloState, initializeApollo } from 'lib/apolloClient';
import { SINGLE_PRODUCT_QUERY } from 'graphql/queries';
import { useQuery } from '@apollo/client';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import HeadComponent from 'components/Head/Head';

type SlugType = {
  slug: String;
};

type ServerSidePropsType = {
  params: SlugType;
};

function Product({ slug }: SlugType) {
  const { loading, error, data } = useQuery(SINGLE_PRODUCT_QUERY, {
    variables: { slug },
  });
  const { increaseCartQuantity, openCart } = useShoppingCart();

  const product = data?.products?.data[0] as ProductType;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts.</div>;
  if (!product?.attributes) return <div>Nie znaleziono produktu.</div>;

  const { title, seo, size, description, galery, category } = product.attributes;

  const addToCart = (cartItemId: string, productId: string, wymiary: string) => {
    openCart();
    increaseCartQuantity(cartItemId, productId, wymiary);
  };

  return (
    <main style={{ minHeight: '700px', padding: '40px' }}>
      <HeadComponent
        title={product.attributes?.seo.Meta_Title || ''}
        description={product.attributes?.seo.Meta_Description || ''}
        keywords={product.attributes?.seo.Meta_Keywords || ''}
      />

      <div>
        <h1>{title}</h1>

        <h2 style={{ paddingBlock: '10px' }}>
          Kategoria: {category?.data?.attributes?.category || 'Nieokreślona'}
        </h2>

        <div style={{ paddingBlock: '20px' }}>
          <h2>Dostępne wymiary:</h2>

          <div>
            <table>
              <tbody>
                <tr>
                  <th>Wymiary:</th>
                  <th>Cena:</th>
                  <th></th>
                </tr>
                {size.map((item) => {
                  if (!item?.price || !item?.size) return null;
                  const { id, price, size, sale } = item;
                  return (
                    <tr key={id}>
                      <td style={{ padding: '10px' }}>{size}</td>
                      <td style={{ padding: '10px' }}>
                        {sale ? (
                          <>
                            <span style={{ display: 'block', color: 'grey' }}>
                              <s>{formatValue(price)}</s>
                            </span>
                            <span>{formatValue(sale)}</span>
                          </>
                        ) : (
                          <>{formatValue(price || 0)}</>
                        )}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => addToCart(uuid(), product.id || '', size)}>
                          Dodaj do koszyka
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <section>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                linkTarget={'_blank'}
                components={{
                  a: ({ node, children, ...props }) => {
                    const linkProps = props;
                    if (props.target === '_blank') {
                      linkProps['rel'] = 'noopener noreferrer';
                    }
                    return <a {...linkProps}>{children}</a>;
                  },
                }}
                /* transformImageUri={} */
              >
                {description || ''}
              </ReactMarkdown>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export async function getServerSideProps({ params }: ServerSidePropsType) {
  const { slug } = params;

  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: SINGLE_PRODUCT_QUERY,
    variables: { slug },
  });

  return addApolloState(apolloClient, {
    props: { slug },
  });
}

export default Product as NextPage;
